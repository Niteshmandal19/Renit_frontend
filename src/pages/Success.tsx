import { Typography, Container } from '@mui/material';

const Success = () => (
  <Container maxWidth="sm">
    <Typography variant="h4" gutterBottom>Payment Successful!</Typography>
    <Typography>Your booking has been confirmed.</Typography>
  </Container>
);

export default Success;