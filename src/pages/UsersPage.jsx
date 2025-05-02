import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'

function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.email !== 'admin@esans.com') {
      navigate('/')
      return
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    setUsers(storedUsers)
  }, [])

  const handleEditClick = (user) => {
    setSelectedUser(user)
    setOpenDialog(true)
  }

  const handleDeleteClick = (userToDelete) => {
    if (userToDelete.email === 'admin@esans.com') {
      setSnackbar({
        open: true,
        message: 'Admin kullanıcısı silinemez!',
        severity: 'error'
      })
      return
    }

    const updatedUsers = users.filter(user => user.email !== userToDelete.email)
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
    setSnackbar({
      open: true,
      message: 'Kullanıcı başarıyla silindi',
      severity: 'success'
    })
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    setSelectedUser(null)
  }

  const handleUserUpdate = () => {
    const updatedUsers = users.map(user =>
      user.email === selectedUser.email ? selectedUser : user
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
    setOpenDialog(false)
    setSnackbar({
      open: true,
      message: 'Kullanıcı bilgileri güncellendi',
      severity: 'success'
    })
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Kullanıcı Yönetimi
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Şehir</TableCell>
              <TableCell>İlçe</TableCell>
              <TableCell>Mahalle</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.city}</TableCell>
                <TableCell>{user.district}</TableCell>
                <TableCell>{user.neighborhood}</TableCell>
                <TableCell>{user.address}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(user)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Ad"
            fullWidth
            value={selectedUser?.firstName || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Soyad"
            fullWidth
            value={selectedUser?.lastName || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="E-posta"
            fullWidth
            disabled
            value={selectedUser?.email || ''}
          />
          <TextField
            margin="dense"
            label="Telefon"
            fullWidth
            value={selectedUser?.phone || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Şehir"
            fullWidth
            value={selectedUser?.city || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, city: e.target.value })}
          />
          <TextField
            margin="dense"
            label="İlçe"
            fullWidth
            value={selectedUser?.district || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, district: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Mahalle"
            fullWidth
            value={selectedUser?.neighborhood || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, neighborhood: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Adres"
            fullWidth
            multiline
            rows={3}
            value={selectedUser?.address || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Şifre"
            type="password"
            fullWidth
            value={selectedUser?.password || ''}
            onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>İptal</Button>
          <Button onClick={handleUserUpdate} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default UsersPage