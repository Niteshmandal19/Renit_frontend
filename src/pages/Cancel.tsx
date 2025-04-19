import { Typography, Container } from '@mui/material';

const Cancel = () => (
  <Container maxWidth="sm">
    <Typography variant="h4" gutterBottom>Payment Canceled</Typography>
    <Typography>Your booking was not completed.</Typography>
  </Container>
);

export default Cancel;