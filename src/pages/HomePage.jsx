import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Chip,
  Collapse,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  CheckCircle as CheckCircleIcon, 
  Autorenew,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useFirebase } from '../contexts/FirebaseContext';
import { essenceService, demandService } from '../firebase/services';

function HomePage() {
  const [essences, setEssences] = useState([]);
  const [demands, setDemands] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useFirebase();

  const [openRows, setOpenRows] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribeEssences = essenceService.subscribeToEssences((updatedEssences) => {
      setEssences(updatedEssences);
    });

    const unsubscribeDemands = demandService.subscribeToDemands((updatedDemands) => {
      setDemands(updatedDemands);
    });

    return () => {
      unsubscribeEssences();
      unsubscribeDemands();
    };
  }, []);

  const handleCreateDemand = async (selectedEssence) => {
    if (!user) {
      setSnackbarMessage('Lütfen giriş yapın');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const amount = 50;

    if (selectedEssence.stockAmount < amount || selectedEssence.totalDemand + amount > selectedEssence.stockAmount) {
      setSnackbarMessage('Stok miktarı yetersiz');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const newDemand = {
        essenceId: selectedEssence.id,
        userId: user.uid,
        userEmail: user.email,
        amount: amount,
        totalPrice: amount * selectedEssence.price,
        category: selectedEssence.category
      };

      await demandService.addDemand(newDemand);
      
      // Update essence total demand
      await essenceService.updateEssence(selectedEssence.id, {
        totalDemand: (selectedEssence.totalDemand || 0) + amount
      });

      setSnackbarMessage('Talep başarıyla oluşturuldu');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error creating demand:', error);
      setSnackbarMessage('Talep oluşturulurken bir hata oluştu');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const toggleRow = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategories = () => {
    const categories = new Set(essences.map(essence => essence.category || 'Kategorisiz'));
    return ['all', ...Array.from(categories)];
  };

  const filteredEssences = essences.filter(essence => {
    const matchesCategory = selectedCategory === 'all' || essence.category === selectedCategory;
    const matchesSearch = essence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         essence.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Esans Listesi
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ara"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}
                label="Kategori"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {getCategories().map(category => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'Tüm Kategoriler' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Kod</TableCell>
              <TableCell>İsim</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Stok Miktarı</TableCell>
              <TableCell align="right">Fiyat</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEssences.map((essence) => (
              <React.Fragment key={essence.id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleRow(essence.id)}
                    >
                      {openRows[essence.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{essence.code}</TableCell>
                  <TableCell>{essence.name}</TableCell>
                  <TableCell>
                    <Chip label={essence.category || 'Kategorisiz'} />
                  </TableCell>
                  <TableCell align="right">{essence.stockAmount}</TableCell>
                  <TableCell align="right">{essence.price}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleCreateDemand(essence)}
                      disabled={!user}
                    >
                      Talep Oluştur
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={openRows[essence.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Detaylar
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Toplam Talep</TableCell>
                              <TableCell>Durum</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>{essence.totalDemand || 0}</TableCell>
                              <TableCell>
                                {essence.stockAmount >= essence.targetAmount ? (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Hedef Tamamlandı"
                                    color="success"
                                  />
                                ) : (
                                  <Chip
                                    icon={<Autorenew />}
                                    label="Devam Ediyor"
                                    color="warning"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbarSeverity}
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default HomePage;