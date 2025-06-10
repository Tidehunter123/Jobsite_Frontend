import Airtable, { Attachment } from 'airtable';

const base = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!);

export interface CandidateProfile {
  id: string;
  name: string;
  headshot: AttachmentField[];
  candidateType: string;
  university: string;
  reviewRecommendation: string;
  client: string;
  orderId?: string;
  status?: string;
  candidateLink?: string;
  clientLink?: string;
  email?: string;
}
interface AttachmentField {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    thumbnails?: {
      small: { url: string; width: number; height: number };
      large: { url: string; width: number; height: number };
      full: { url: string; width: number; height: number };
    };
  }

// Helper to fetch status from Candidate-Client Feedback table
async function getCandidateStatus({ email, orderId }: { email: string, orderId: string }): Promise<string | undefined> {
  try {
    console.log('Fetching candidate status with params:', { email, orderId });
    
    const filterFormula = `AND({Candidate Email (from Candidate)} = '${email}', {Order ID} = '${orderId}')`;
    console.log('Using filter formula:', filterFormula);
    
    const records = await base('Candidate-Client Feedback')
      .select({
        filterByFormula: filterFormula,
        maxRecords: 1,
        view: 'Grid view',
      })
      .all();
    
    console.log('Found records:', records.length);
    
    if (records.length > 0) {
      const status = records[0].get('Would you like to interview this candidate?') as string | undefined;
      console.log('Retrieved status:', status);
      return status;
    }
    console.log('No records found, returning undefined');
    return undefined;
  } catch (error) {
    console.error('Error fetching candidate status:', error);
    return undefined;
  }
}

export async function getCandidatesByOrderId(orderId: string): Promise<CandidateProfile[]> {
  try {
    console.log('orderId', orderId);
    const records = await base('Candidate-Client Profile')
      .select({
        filterByFormula: `AND({Order ID} = '${orderId}', {Show/Hide} = 'Show')`,
        view: 'Grid view'
      })
      .all();

    console.log('records', records);

    const customOrder = ['A', 'B', 'C'];
    const candidates = await Promise.all(records.map(async record => {
      const candidateLink = record.get('Candidate') as string;
      const clientLink = record.get('Client') as string;
      const orderId = record.get('Order ID') as string;
      const email = record.get('Email') as string;
      const status = await getCandidateStatus({ email, orderId });
      return {
        id: record.id,
        name: record.get('Candidate Name') as string,
        headshot: (record.get("Headshot") as AttachmentField[]) || null,
        candidateType: record.get('Candidate Type Lookup') as string,
        university: record.get('University Lookup') as string,
        reviewRecommendation: record.get('Reviewer Recommendation Lookup') as string,
        client: record.get('Company Name') as string,
        recommendationLevel: (record.get('Recommendation Level') as string[])[0] || '',
        candidateLink,
        clientLink,
        orderId,
        status,
        email: record.get('Email') as string,
      };
    }));
    console.log('candidates', candidates);
    candidates.sort((a, b) => customOrder.indexOf(a.recommendationLevel) - customOrder.indexOf(b.recommendationLevel));

    // Remove recommendationLevel from the returned object if not needed
    return candidates.map(({ recommendationLevel, ...rest }) => rest);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
} 