import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Collapse,
  Chip
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Autorenew
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useFirebase } from '../contexts/FirebaseContext';
import { essenceService } from '../firebase/services';

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useFirebase();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const [essences, setEssences] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editingEssence, setEditingEssence] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 250,
    stockAmount: 0,
    code: '',
    price: 0,
    category: ''
  });

  useEffect(() => {
    const unsubscribe = essenceService.subscribeToEssences((updatedEssences) => {
      setEssences(updatedEssences);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (essence = null) => {
    if (essence) {
      setEditingEssence(essence);
      setFormData({
        name: essence.name,
        code: essence.code,
        targetAmount: essence.targetAmount,
        stockAmount: essence.stockAmount,
        price: essence.price,
        category: essence.category || ''
      });
    } else {
      setEditingEssence(null);
      setFormData({
        name: '',
        code: '',
        targetAmount: 250,
        stockAmount: 0,
        price: 0,
        category: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEssence(null);
    setFormData({
      name: '',
      code: '',
      targetAmount: 250,
      stockAmount: 0,
      price: 0,
      category: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingEssence) {
        await essenceService.updateEssence(editingEssence.id, formData);
        setSnackbarMessage('Esans başarıyla güncellendi');
      } else {
        await essenceService.addEssence(formData);
        setSnackbarMessage('Yeni esans başarıyla eklendi');
      }
      setOpenSnackbar(true);
      handleCloseDialog();
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Bir hata oluştu');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await essenceService.deleteEssence(id);
      setSnackbarMessage('Esans başarıyla silindi');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('Silme işlemi başarısız oldu');
      setOpenSnackbar(true);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData) {
          await essenceService.addEssence({
            name: row.name || '',
            code: row.code || '',
            targetAmount: Number(row.targetAmount) || 250,
            stockAmount: Number(row.stockAmount) || 0,
            price: Number(row.price) || 0,
            category: row.category || ''
          });
        }

        setSnackbarMessage('Excel dosyası başarıyla yüklendi');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error:', error);
        setSnackbarMessage('Excel yükleme işlemi başarısız oldu');
        setOpenSnackbar(true);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(essences);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Essences');
    XLSX.writeFile(workbook, 'essences.xlsx');
  };

  const toggleRow = (id) => {
    setOpenRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Esans Yönetimi
        </Typography>
        <Box>
          <input
            type="file"
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            id="file-upload"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="contained"
              startIcon={<Autorenew />}
              sx={{ mr: 1 }}
            >
              Excel Yükle
            </Button>
          </label>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 1 }}
          >
            Excel İndir
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Esans
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Kod</TableCell>
              <TableCell>İsim</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Hedef Miktar</TableCell>
              <TableCell align="right">Stok Miktarı</TableCell>
              <TableCell align="right">Fiyat</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {essences.map((essence) => (
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
                  <TableCell align="right">{essence.targetAmount}</TableCell>
                  <TableCell align="right">{essence.stockAmount}</TableCell>
                  <TableCell align="right">{essence.price}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(essence)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(essence.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingEssence ? 'Esans Düzenle' : 'Yeni Esans Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Kod"
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="İsim"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Kategori"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Hedef Miktar"
            type="number"
            fullWidth
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Stok Miktarı"
            type="number"
            fullWidth
            value={formData.stockAmount}
            onChange={(e) => setFormData({ ...formData, stockAmount: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Fiyat"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEssence ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default AdminPage;