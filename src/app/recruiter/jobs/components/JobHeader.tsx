import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tab,
  Tabs,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  MdDelete,
  MdContentCopy,
  MdVisibilityOff,
} from 'react-icons/md';
import Airtable, { FieldSet } from 'airtable';
import { config } from '@/config';
import { toast } from '@/components/core/toaster';


interface JobHeaderProps {
  jobId: string;
  jobTitle: string;
  tabValue: number;
  showHide: string;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');


export const JobHeader: React.FC<JobHeaderProps> = ({
  jobId,
  jobTitle,
  tabValue,
  showHide,
  onTabChange,
  }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleShowHide = () => {
    console.log('Show/Hide button clicked');  
    // TODO: Implement show/hide functionality
    const newStatus = showHide === 'Hide' ? 'Show' : 'Hide';

    base('Job Postings').update(jobId, {
      'Show/Hide': newStatus
    }, (err, record) => {   
      if (err) {  
        toast.error('Error updating job status:', err);
      } else {
        toast.success('Job status updated successfully');
        window.location.reload();
      }
    });
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    base('Job Postings').destroy(jobId, (err, deletedRecord) => {
      if (err) {
        toast.error('Error deleting job:', err);
      } else {
        toast.success('Job deleted successfully');
        window.location.reload();
      }
    });
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          {jobTitle}
        </Typography>
        <Box
          sx={{
            bgcolor: 'primary.lighter',
            color: '#3B82F6',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            typography: 'caption',
            fontWeight: 'bold',
          }}
        >
          {showHide === 'Hide' ? 'Hidden' : 'Live'}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" sx={{ border: 1, borderColor: 'divider' }} onClick={handleShowHide}>
          <MdVisibilityOff />
        </IconButton>
        <IconButton size="small" sx={{ border: 1, borderColor: 'divider' }}>
          <MdContentCopy />
        </IconButton>
        <IconButton size="small" sx={{ border: 1, borderColor: 'divider', color: 'red' }} onClick={handleDeleteClick}>
          <MdDelete />
        </IconButton>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={onTabChange} 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .Mui-selected': {
            color: '#3B82F6 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#3B82F6',
          }
        }}
      >
        <Tab label="Overview" />
        <Tab label="Edit Job" />
      </Tabs>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ 
          color: 'error.main',
          fontWeight: 600
        }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Are you sure you want to delete this job posting?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 1,
              textTransform: 'none',
              px: 3
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 