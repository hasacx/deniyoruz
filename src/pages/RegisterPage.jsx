import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Container, TextField, Button, Typography, Paper, Snackbar } from '@mui/material'
import MuiAlert from '@mui/material/Alert'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    let newValue = value
    
    if (name === 'phone' && value) {
      newValue = value.startsWith('0') ? value : '0' + value
      newValue = newValue.slice(0, 11)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }))
    
    // Hata mesajlarını temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Şifre kontrolü
    if (formData.password.length < 6 || formData.password.length > 20) {
      newErrors.password = 'Şifre 6-20 karakter arasında olmalıdır'
    }

    // Telefon numarası kontrolü
    if (formData.phone.length !== 11 || !formData.phone.startsWith('0')) {
      newErrors.phone = 'Telefon numarası 11 haneli olmalı ve 0 ile başlamalıdır'
    }

    // E-posta kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }

    // Ad ve soyad kontrolü
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı boş bırakılamaz'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı boş bırakılamaz'
    }

    // Adres bilgileri kontrolü
    if (!formData.city.trim()) {
      newErrors.city = 'İl alanı boş bırakılamaz'
    }
    if (!formData.district.trim()) {
      newErrors.district = 'İlçe alanı boş bırakılamaz'
    }
    if (!formData.neighborhood.trim()) {
      newErrors.neighborhood = 'Mahalle alanı boş bırakılamaz'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Açık adres alanı boş bırakılamaz'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Mevcut kullanıcıları kontrol et
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const isEmailExists = existingUsers.some(user => user.email === formData.email)

    if (isEmailExists) {
      setErrors({ email: 'Bu e-posta adresi zaten kullanımda' })
      return
    }

    // Yeni kullanıcıyı kaydet
    const newUser = {
      ...formData,
      role: 'user',
      id: Date.now()
    }

    existingUsers.push(newUser)
    localStorage.setItem('users', JSON.stringify(existingUsers))

    // Kayıt başarılı
    setOpenSnackbar(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Kayıt Ol
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="Ad"
              name="firstName"
              autoFocus
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Soyad"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || '6-20 karakter arası olmalıdır'}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Telefon Numarası"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone || '11 haneli telefon numarası (0 ile başlar)'}
              inputProps={{ maxLength: 11 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="city"
              label="İl"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="district"
              label="İlçe"
              name="district"
              value={formData.district}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="neighborhood"
              label="Mahalle"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="address"
              label="Açık Adres"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={3}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Kayıt Ol
            </Button>
            <Typography align="center">
              Zaten hesabınız var mı?{' '}
              <Link to="/" style={{ textDecoration: 'none' }}>
                Giriş Yap
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" severity="success">
          Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
        </MuiAlert>
      </Snackbar>
    </Container>
  )
}

export default RegisterPage