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

    // Firestore'dan esansları getir
    const fetchEssences = async () => {
      try {
        const essencesSnapshot = await getDocs(collection(db, 'essences'))
        const essencesList = essencesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          totalDemand: 0
        }))

        // Talepleri getir ve toplam talepleri hesapla
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
        console.error('Esansları getirirken hata oluştu:', error)
        setSnackbarMessage('Esansları getirirken hata oluştu')
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
  const [editingEssence, setEditingEssence] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 250,
    stockAmount: 0,
    code: '',
    price: 0,
    category: ''
  })

  useEffect(() => {
    localStorage.setItem('essences', JSON.stringify(essences))
  }, [essences])

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

        setEssences(prev =>
          prev.map(essence =>
            essence.id === editingEssence.id
              ? { ...essence, ...formData }
              : essence
          )
        )
        setSnackbarMessage('Esans başarıyla güncellendi')
      } else {
        // Yeni esans ekle
        const docRef = await addDoc(collection(db, 'essences'), {
          name: formData.name,
          code: formData.code,
          targetAmount: Number(formData.targetAmount),
          stockAmount: Number(formData.stockAmount),
          price: Number(formData.price),
          category: formData.category,
          totalDemand: 0
        })

        const newEssence = {
          id: docRef.id,
          ...formData,
          totalDemand: 0
        }
        setEssences(prev => [...prev, newEssence])
        setSnackbarMessage('Yeni esans başarıyla eklendi')
      }

      setOpenSnackbar(true)
      handleCloseDialog()
    } catch (error) {
      console.error('Esans kaydedilirken hata oluştu:', error)
      setSnackbarMessage('Esans kaydedilirken hata oluştu')
      setOpenSnackbar(true)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'essences', id))
      setEssences(prev => prev.filter(essence => essence.id !== id))
      setSnackbarMessage('Esans başarıyla silindi')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Esans silinirken hata oluştu:', error)
      setSnackbarMessage('Esans silinirken hata oluştu')
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
        const newEssences = jsonData.slice(1).filter(row => row.length > 0).map((row) => ({
          name: row[0],
          code: row[1] || `ES${Date.now().toString(36)}`,
          category: row[2] || '',
          stockAmount: Number(row[3]) || 0,
          totalDemand: Number(row[4]) || 0,
          price: Number(row[5]) || 0,
          targetAmount: 250,
          createdAt: new Date()
        }))

        // Firestore'a yeni esansları ekle
        for (const essence of newEssences) {
          try {
            const docRef = await addDoc(collection(db, 'essences'), essence)
            const newEssence = {
              id: docRef.id,
              ...essence
            }
            setEssences(prev => [...prev, newEssence])
          } catch (error) {
            console.error('Esans eklenirken hata:', error)
            setSnackbarMessage('Esans eklenirken hata oluştu')
            setOpenSnackbar(true)
            return
          }
        }

        setSnackbarMessage(`${newEssences.length} esans başarıyla içe aktarıldı`)
        setOpenSnackbar(true)
      } catch (error) {
        console.error('Excel dosyası işlenirken hata:', error)
        setSnackbarMessage('Excel dosyası işlenirken hata oluştu')
        setOpenSnackbar(true)
      }
    }

    reader.readAsArrayBuffer(file)
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
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default AdminPage