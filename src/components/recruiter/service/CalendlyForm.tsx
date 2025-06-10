import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  InputAdornment,
  Alert,
} from "@mui/material";
import { MdLink, MdCalendarToday, MdArrowBack, MdSend } from "react-icons/md";
import { CandidateProfile } from "../../../utils/airtable";
import Airtable from "airtable";
import { config } from "@/config";
import { toast } from "@/components/core/toaster";

interface CalendlyFormProps {
  onBack: () => void;
  candidate?: CandidateProfile;
}

interface FormErrors {
  calendlyLink?: string;
  availability?: string;
}

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export function CalendlyForm({ onBack, candidate }: CalendlyFormProps) {
  const [calendlyLink, setCalendlyLink] = useState("");
  const [availability, setAvailability] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExistingData = async () => {
      console.log('Starting to fetch existing data for candidate:', candidate?.name);

      if (!candidate?.name) {
        console.log('No candidate link provided, skipping fetch');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Querying Airtable for existing records...');
        const records = await base('Candidate-Client Feedback')
          .select({
            filterByFormula: `AND({Candidate} = '${candidate.name}', {Order ID} = '${candidate.orderId}')`,
            maxRecords: 1
          })
          .firstPage();

        console.log('Airtable query completed, found records:', records.length);

        if (records.length > 0) {
          const record = records[0];
          const calendlyValue = record.get('Do you have a calendly invite we can include?');
          const availabilityValue = record.get('If you don\'t have any calendly link, please type availablity that we can share to student.');

          console.log('Found existing data:', {
            calendly: calendlyValue,
            availability: availabilityValue
          });

          setCalendlyLink(typeof calendlyValue === 'string' ? calendlyValue : '');
          setAvailability(typeof availabilityValue === 'string' ? availabilityValue : '');
        } else {
          console.log('No existing records found for this candidate');
        }
      } catch (error) {
        console.error('Error fetching existing data:', error);
      } finally {
        console.log('Data fetching process completed');
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [candidate?.name]);

  const validateCalendlyLink = (link: string): string | undefined => {
    if (!link) return undefined;

    const calendlyRegex = /^https:\/\/calendly\.com\/[\w-]+(\/[\w-]+)?$/;
    if (!calendlyRegex.test(link)) {
      return "Please enter a valid Calendly URL (e.g., https://calendly.com/username)";
    }
    return undefined;
  };

  const validateAvailability = (text: string): string | undefined => {
    if (!text) return undefined;

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return "Please enter at least one time slot";
    }

    const dateTimeRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}\s+(0[1-9]|1[0-2]):[0-5]\d\s+(AM|PM)\s+ET$/i;

    for (const line of lines) {
      const cleanLine = line.trim().replace(/^[•-]\s*/, '');
      if (!dateTimeRegex.test(cleanLine)) {
        return "Please use the correct format: MM/DD/YYYY HH:MM AM/PM ET";
      }
    }
    return undefined;
  };

  const handleCalendlyLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCalendlyLink(value);
    const error = validateCalendlyLink(value);
    setErrors(prev => ({ ...prev, calendlyLink: error }));
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAvailability(value);
    const error = validateAvailability(value);
    setErrors(prev => ({ ...prev, availability: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const calendlyError = validateCalendlyLink(calendlyLink);
    const availabilityError = validateAvailability(availability);

    const newErrors: FormErrors = {};
    if (calendlyError) newErrors.calendlyLink = calendlyError;
    if (availabilityError) newErrors.availability = availabilityError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!calendlyLink && !availability) {
      setErrors({
        calendlyLink: "Please provide either a Calendly link or your availability",
        availability: "Please provide either a Calendly link or your availability"
      });
      return;
    }

    if (!candidate?.candidateLink) {
      console.error('No candidate link provided');
      return;
    }

    // Handle form submission
    console.log({ calendlyLink, availability, candidate });
    try {
      const existingRecord = await base('Candidate-Client Feedback').select({
        filterByFormula: `AND({Candidate} = '${candidate.name}', {Order ID} = '${candidate.orderId}')`,
        maxRecords: 1
      }).firstPage();
      if (existingRecord.length > 0) {
        const record = await base('Candidate-Client Feedback').update(existingRecord[0].id, {
          'Do you have a calendly invite we can include?': calendlyLink || '',
          'If you don\'t have any calendly link, please type availablity that we can share to student.': availability || '',
          'Would you like to interview this candidate?': 'Interview',
          'Order ID': candidate.orderId || '',
          'Candidate': candidate.candidateLink || '',
          'Client': candidate.clientLink || ''
        });
        console.log('Successfully created record:', record);
        toast.success('Interview scheduled successfully');
      } else {
        const record = await base('Candidate-Client Feedback').create({
          'Do you have a calendly invite we can include?': calendlyLink || '',
          'If you don\'t have any calendly link, please type availablity that we can share to student.': availability || '',
          'Would you like to interview this candidate?': 'Interview',
          'Order ID': candidate.orderId || '',
          'Candidate': candidate.candidateLink || '',
          'Client': candidate.clientLink || ''
        });
        console.log('Successfully created record:', record);
        toast.success('Interview scheduled successfully');
      }
      onBack();
    } catch (error) {
      console.error('Error creating Airtable record:', error);
      toast.error('Error scheduling interview');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        mt: 4,
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}
    >
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" color="#3B82F6" gutterBottom>
          Schedule Interview with {candidate?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please provide your Calendly link or preferred interview times to help us schedule your interview efficiently.
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Calendly Link
              </Typography>
              <TextField
                fullWidth
                value={calendlyLink}
                onChange={handleCalendlyLinkChange}
                placeholder="https://calendly.com/your-username"
                variant="outlined"
                error={!!errors.calendlyLink}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdLink size={20} color="#666" />
                    </InputAdornment>
                  ),
                }}
                helperText={errors.calendlyLink || "If you have a Calendly account, paste your scheduling link here"}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Manual Availability
              </Typography>
              <TextField
                fullWidth
                value={availability}
                onChange={handleAvailabilityChange}
                multiline
                minRows={4}
                placeholder="Please provide your available time slots in the following format:
• Date: MM/DD/YYYY
• Time: HH:MM AM/PM ET
• Example: 04/02/2025 4:00 PM ET, 04/10/2025 9:00 AM ET"
                variant="outlined"
                error={!!errors.availability}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdCalendarToday size={20} color="#666" />
                    </InputAdornment>
                  ),
                }}
                helperText={errors.availability || "If you don't have a Calendly account, please list your available time slots"}
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<MdArrowBack size={20} />}
                onClick={handleBack}
                sx={{
                  px: 3,
                  color: '#3B82F6',
                  borderColor: '#3B82F6',
                  "&:hover": {
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }
                }}
              >
                Previous
              </Button>
              <Button
                type="submit"
                startIcon={<MdSend size={20} />}
                sx={{
                  px: 3,
                  bgcolor: "#3B82F6",
                  color: 'white',
                  "&:hover": {
                    bgcolor: "white",
                    color: "#3B82F6",
                    borderColor: "#3B82F6",
                  }
                }}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </form>
      )}
    </Paper>
  );
} 