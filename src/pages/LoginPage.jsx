import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Container, TextField, Button, Typography, Paper, Snackbar } from '@mui/material'
import MuiAlert from '@mui/material/Alert'

function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    // Admin kullanıcısını kontrol et ve güncelle/ekle
    const adminUser = users.find(user => user.email === 'admin@esans.com')
    if (!adminUser) {
      const updatedUsers = users.filter(user => user.email !== 'admin@esans.com')
      updatedUsers.push({
        id: Date.now(),
        email: 'admin@esans.com',
        password: '951623',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '05555555555',
        city: 'İstanbul',
        district: 'Merkez',
        address: 'Admin Binası'
      })
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    }
  }, [])

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const [error, setError] = useState('')

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurun')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi girin')
      return false
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return false
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    // Kullanıcı bilgilerini localStorage'dan al
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === formData.email)
    
    if (!user) {
      setError('Kullanıcı bulunamadı')
      return
    }

    if (user.password !== formData.password) {
      setError('Hatalı şifre')
      return
    }

    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem('currentUser', JSON.stringify({
      email: user.email,
      role: user.role
    }))

    setOpenSnackbar(true)
    setTimeout(() => {
      navigate('/home')
    }, 1500)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#3366CC',
        backgroundImage: 'linear-gradient(135deg, #3366CC 0%, #4B7BE5 100%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: '#1A237E',
              fontWeight: 'bold',
              mb: 1,
            }}
          >
            Sipariş Takip Sistemi
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-posta Adresi"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#3366CC',
                },
                '&:hover fieldset': {
                  borderColor: '#1A237E',
                },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#3366CC',
                },
                '&:hover fieldset': {
                  borderColor: '#1A237E',
                },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: '#3366CC',
              '&:hover': {
                bgcolor: '#1A237E',
              },
              borderRadius: 1,
            }}
          >
            Giriş Yap
          </Button>
          <Typography align="center" color="textSecondary" sx={{ mt: 2 }}>
            Demo Hesapları:
          </Typography>
          <Typography align="center" color="textSecondary" fontSize="small">
            Admin girişi: admin@esans.com / 951623
          </Typography>
        </Box>
      </Paper>
      {error && (
        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
          <MuiAlert elevation={6} variant="filled" severity="error" onClose={() => setError('')}>
            {error}
          </MuiAlert>
        </Snackbar>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={1500} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" severity="success">
          Giriş başarılı! Yönlendiriliyorsunuz...
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default LoginPage