import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
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
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Autorenew
} from '@mui/icons-material'
import * as XLSX from 'xlsx'

function AdminPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.email !== 'admin@esans.com') {
      navigate('/')
    }

    const fetchEssences = async () => {
      try {
        const essencesSnapshot = await getDocs(collection(db, 'essences'))
        const essencesList = essencesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          totalDemand: 0 // Initialize totalDemand
        }))
    
        // Fetch demands and calculate total demands
        const demandsSnapshot = await getDocs(collection(db, 'demands'))
        demandsSnapshot.docs.forEach(doc => {
          const demand = doc.data()
          const essence = essencesList.find(e => e.id === demand.essenceId)
          if (essence) {
            essence.totalDemand = (essence.totalDemand || 0) + demand.quantity
          }
        })
    
        setEssences(essencesList)
      } catch (error) {
        console.error('Error fetching essences:', error)
        setSnackbarMessage(`Error fetching essences: ${error.message}`) // Show specific error
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }

    fetchEssences()
  }, [])

  const [essences, setEssences] = useState(() => {
    const savedEssences = localStorage.getItem('essences')
    return savedEssences ? JSON.parse(savedEssences) : [
      { id: 1, name: 'Lavanta', totalDemand: 150, targetAmount: 250, stockAmount: 0 },
      { id: 2, name: 'Vanilya', totalDemand: 200, targetAmount: 250, stockAmount: 0 },
      { id: 3, name: 'Yasemin', totalDemand: 100, targetAmount: 250, stockAmount: 0 },
      { id: 4, name: 'Gül', totalDemand: 250, targetAmount: 250, stockAmount: 0 },
    ]
  })

  const [openRows, setOpenRows] = useState({})
  const [openDialog, setOpenDialog] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success') // Add severity state
  const [editingEssence, setEditingEssence] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 250,
    stockAmount: 0,
    code: '',
    price: 0,
    category: ''
  })

  // Extracted fetch function
  const fetchEssences = async () => {
    try {
      const essencesSnapshot = await getDocs(collection(db, 'essences'))
      const essencesList = essencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        totalDemand: 0 // Initialize totalDemand
      }))
  
      // Fetch demands and calculate total demands
      const demandsSnapshot = await getDocs(collection(db, 'demands'))
      demandsSnapshot.docs.forEach(doc => {
        const demand = doc.data()
        const essence = essencesList.find(e => e.id === demand.essenceId)
        if (essence) {
          essence.totalDemand = (essence.totalDemand || 0) + demand.quantity
        }
      })
  
      setEssences(essencesList)
    } catch (error) {
      console.error('Error fetching essences:', error)
      setSnackbarMessage(`Error fetching essences: ${error.message}`) // Show specific error
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.email !== 'admin@esans.com') {
      navigate('/')
    }
    fetchEssences() // Initial fetch
  }, [navigate]) // Add navigate to dependency array

  // Remove the useEffect that saves to localStorage, as state is now driven by Firestore
  // useEffect(() => {
  //   localStorage.setItem('essences', JSON.stringify(essences))
  // }, [essences])

  const handleOpenDialog = (essence = null) => {
    if (essence) {
      setEditingEssence(essence)
      setFormData({
        name: essence.name,
        code: essence.code,
        targetAmount: essence.targetAmount,
        stockAmount: essence.stockAmount,
        price: essence.price,
        category: essence.category || ''
      })
    } else {
      setEditingEssence(null)
      setFormData({
        name: '',
        code: '',
        targetAmount: 250,
        stockAmount: 0,
        price: 0,
        category: ''
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingEssence(null)
    setFormData({
      name: '',
      code: '',
      targetAmount: 250,
      stockAmount: 0,
      price: 0
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.code || !/^[A-Za-z0-9]+$/.test(formData.code)) {
      setSnackbarMessage('Lütfen geçerli bir kod giriniz (sadece harf ve rakam içerebilir)')
      setSnackbarSeverity('warning') // Use warning severity
      setOpenSnackbar(true)
      return
    }

    try {
      if (editingEssence) {
        // Mevcut esansı güncelle
        const essenceRef = doc(db, 'essences', editingEssence.id)
        await updateDoc(essenceRef, {
          name: formData.name,
          code: formData.code,
          targetAmount: Number(formData.targetAmount),
          stockAmount: Number(formData.stockAmount),
          price: Number(formData.price),
          category: formData.category
        })
        // Remove optimistic update
        // setEssences(prev =>
        //   prev.map(essence =>
        //     essence.id === editingEssence.id
        //       ? { ...essence, ...formData }
        //       : essence
        //   )
        // )
        setSnackbarMessage('Esans başarıyla güncellendi')
        setSnackbarSeverity('success')
      } else {
        // Yeni esans ekle
        const docRef = await addDoc(collection(db, 'essences'), {
          name: formData.name,
          code: formData.code,
          targetAmount: Number(formData.targetAmount),
          stockAmount: Number(formData.stockAmount),
          price: Number(formData.price),
          category: formData.category,
          totalDemand: 0 // Ensure totalDemand is added
        })
        // Remove optimistic update
        // const newEssence = {
        //   id: docRef.id,
        //   ...formData,
        //   totalDemand: 0
        // }
        // setEssences(prev => [...prev, newEssence])
        setSnackbarMessage('Yeni esans başarıyla eklendi')
        setSnackbarSeverity('success')
      }

      setOpenSnackbar(true)
      handleCloseDialog()
      fetchEssences() // Re-fetch after successful add/update
    } catch (error) {
      console.error('Esans kaydedilirken hata oluştu:', error)
      setSnackbarMessage(`Esans kaydedilirken hata oluştu: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'essences', id))
      // Remove optimistic update
      // setEssences(prev => prev.filter(essence => essence.id !== id))
      setSnackbarMessage('Esans başarıyla silindi')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
      fetchEssences() // Re-fetch after successful delete
    } catch (error) {
      console.error('Esans silinirken hata oluştu:', error)
      setSnackbarMessage(`Esans silinirken hata oluştu: ${error.message}`)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  const downloadTemplate = () => {
    const template = [
      ['Esans Adı', 'Esans Kodu', 'Kategori', 'Stok Miktarı (gr)', 'Toplam Talep (gr)', 'Fiyat (TL/gr)'],
      ['Örnek Esans 1', 'ES001', 'Kategori 1', 0, 0, 0],
      ['Örnek Esans 2', 'ES002', 'Kategori 2', 0, 0, 0]
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Esans Şablonu')
    XLSX.writeFile(wb, 'esans_sablonu.xlsx')
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // İlk satırı (başlıkları) atla ve verileri işle
        const newEssencesData = jsonData.slice(1).filter(row => row.length > 0 && row[0]).map((row) => ({
          name: row[0],
          code: row[1] || `ES${Date.now().toString(36)}`,
          category: row[2] || '',
          stockAmount: Number(row[3]) || 0,
          // totalDemand should be calculated, not imported directly from template
          price: Number(row[5]) || 0,
          targetAmount: 250, // Default target amount
          totalDemand: 0 // Initialize totalDemand
          // createdAt: new Date() // Firestore automatically adds timestamps if configured
        }))

        if (newEssencesData.length === 0) {
          setSnackbarMessage('Excel dosyasında geçerli esans verisi bulunamadı.')
          setSnackbarSeverity('warning')
          setOpenSnackbar(true)
          return;
        }

        // Firestore'a yeni esansları ekle
        let errorOccurred = false;
        let addedCount = 0;
        for (const essenceData of newEssencesData) {
          try {
            // Add validation if needed (e.g., check for existing code)
            await addDoc(collection(db, 'essences'), essenceData)
            addedCount++;
            // Remove optimistic update
            // const newEssence = {
            //   id: docRef.id,
            //   ...essenceData
            // }
            // setEssences(prev => [...prev, newEssence]) 
          } catch (error) {
            console.error('Esans eklenirken hata:', error)
            setSnackbarMessage(`Esans eklenirken hata oluştu (${essenceData.name || 'Bilinmeyen'}): ${error.message}`)
            setSnackbarSeverity('error')
            setOpenSnackbar(true)
            errorOccurred = true;
            break; // Stop processing on first error
          }
        }

        if (!errorOccurred) {
          setSnackbarMessage(`${addedCount} esans başarıyla içe aktarıldı`)
          setSnackbarSeverity('success')
          setOpenSnackbar(true)
          fetchEssences() // Re-fetch after successful bulk upload
        }
      } catch (error) {
        console.error('Excel dosyası işlenirken hata:', error)
        setSnackbarMessage(`Excel dosyası işlenirken hata oluştu: ${error.message}`)
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }

    reader.onerror = (error) => {
        console.error('Dosya okuma hatası:', error);
        setSnackbarMessage('Dosya okunurken bir hata oluştu.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
    };

    reader.readAsArrayBuffer(file)
    // Reset file input to allow uploading the same file again if needed
    event.target.value = null;
  }

  const toggleRow = (id) => {
    setOpenRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <Typography variant="h4" component="h1">
          Esans Yönetimi
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{ mr: 2 }}
          >
            Şablon İndir
          </Button>
          <Button
            variant="outlined"
            component="label"
            sx={{ mr: 2 }}
          >
            Excel Yükle
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Esans Ekle
          </Button>
        </Box>
      </Box>



      <Box sx={{ mt: 4, pt: 4 }}>

        <TableContainer component={props => <Paper {...props} elevation={0} />} sx={{ backgroundColor: '#fff', marginTop: 0, marginBottom: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none" width="48px" />
                <TableCell>Esans Adı</TableCell>
                <TableCell>Esans Kodu</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell align="right">Stok Miktarı (gr)</TableCell>
                <TableCell align="right">Toplam Talep (gr)</TableCell>
                <TableCell align="right">Fiyat (TL/gr)</TableCell>
                <TableCell align="right">Durum</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {essences.map((essence) => {
                const isConfirmedPurchase = essence.totalDemand >= 250
                
                return (
                  <React.Fragment key={essence.id}>
                    <TableRow>
                      <TableCell padding="none">
                        <IconButton
                          size="small"
                          onClick={() => toggleRow(essence.id)}
                        >
                          {openRows[essence.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{essence.name}</TableCell>
                      <TableCell>{essence.code}</TableCell>
                      <TableCell>{essence.category || '-'}</TableCell>
                      <TableCell align="right">{essence.stockAmount}</TableCell>
                      <TableCell align="right">{essence.totalDemand}</TableCell>
                      <TableCell align="right">{essence.price}</TableCell>
                      <TableCell align="right">
                        {isConfirmedPurchase ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Kesin Alım"
                            color="warning"
                            variant="outlined"
                            sx={{
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<Autorenew />}
                            label="Talep Toplanıyor"
                            color="primary"
                            variant="outlined"
                            sx={{
                              '& .MuiChip-icon': {
                                color: 'inherit'
                              }
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(essence)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
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
                              Talep Geçmişi
                            </Typography>
                            <Table size="small" sx={{ backgroundColor: '#fff' }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Ad Soyad</TableCell>
                                  <TableCell>Telefon</TableCell>
                                  <TableCell align="right">Talep Miktarı (gr)</TableCell>
                                  <TableCell align="right">Birim Fiyat (TL/gr)</TableCell>
                                  <TableCell align="right">Toplam Tutar (TL)</TableCell>
                                  <TableCell align="right">Tarih</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(essence.demands || []).map((demand) => {
                                  const users = JSON.parse(localStorage.getItem('users') || '[]')
                                  const userDetails = users.find(u => 
                                    `${u.firstName} ${u.lastName}` === demand.userName
                                  )
                                  
                                  return (
                                    <TableRow key={demand.id}>
                                      <TableCell component="th" scope="row">
                                        {demand.userName}
                                      </TableCell>
                                      <TableCell>
                                        {userDetails?.phone || '-'}
                                      </TableCell>
                                      <TableCell align="right">{demand.amount}</TableCell>
                                      <TableCell align="right">{essence.price}</TableCell>
                                      <TableCell align="right">{demand.amount * essence.price}</TableCell>
                                      <TableCell align="right">
                                        {new Date(demand.date).toLocaleDateString('tr-TR')}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingEssence ? 'Esans Düzenle' : 'Yeni Esans Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Esans Adı"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="code"
            label="Esans Kodu"
            type="text"
            fullWidth
            value={formData.code}
            onChange={handleInputChange}
            helperText="Sadece harf ve rakam içerebilir"
          />
          <TextField
            margin="dense"
            name="stockAmount"
            label="Stok Miktarı (gr)"
            type="number"
            fullWidth
            value={formData.stockAmount}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Fiyat (TL/gr)"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Kategori"
            type="text"
            fullWidth
            value={formData.category}
            onChange={handleInputChange}
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
        autoHideDuration={6000} // Increase duration slightly
        onClose={() => setOpenSnackbar(false)}
      >
        {/* Use Alert component directly for severity control */}
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbarSeverity} // Use state for severity
          onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default AdminPage