import { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Card, CardContent, IconButton, Snackbar, Checkbox, Button } from '@mui/material'
import { Person as PersonIcon, Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon, LocationCity as LocationCityIcon, Home as HomeIcon, Delete as DeleteIcon } from '@mui/icons-material'
import MuiAlert from '@mui/material/Alert'

function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: ''
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const [selectedDemands, setSelectedDemands] = useState([])

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userDetails = users.find(u => u.email === currentUser.email)
      if (userDetails) {
        setUserInfo(userDetails)
      }
    }
  }, [])

  const [demands, setDemands] = useState([
  ])

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (currentUser) {
      const essences = JSON.parse(localStorage.getItem('essences') || '[]')
      const userDemands = []

      essences.forEach(essence => {
        if (essence.demands) {
          const userEssenceDemands = essence.demands.filter(demand => 
            demand.userName === `${userInfo.firstName} ${userInfo.lastName}`
          ).map(demand => ({
            id: demand.id,
            essenceName: essence.name,
            essenceId: essence.id,
            amount: demand.amount,
            date: demand.date,
            price: essence.price,
            category: essence.category
          }))
          userDemands.push(...userEssenceDemands)
        }
      })

      // Talepleri tarihe göre sırala (en yeni en üstte)
      userDemands.sort((a, b) => new Date(b.date) - new Date(a.date))
      setDemands(userDemands)
    }
  }, [userInfo.firstName, userInfo.lastName])

  const handleDemandDelete = (demandToDelete) => {
    const essences = JSON.parse(localStorage.getItem('essences') || '[]')
    const updatedEssences = essences.map(essence => {
      if (essence.id === demandToDelete.essenceId) {
        const updatedDemands = essence.demands.filter(
          demand => demand.id !== demandToDelete.id
        )
        const newTotalDemand = essence.totalDemand - demandToDelete.amount
        return {
          ...essence,
          demands: updatedDemands,
          totalDemand: newTotalDemand
        }
      }
      return essence
    })

    localStorage.setItem('essences', JSON.stringify(updatedEssences))
    setDemands(prevDemands => prevDemands.filter(demand => demand.id !== demandToDelete.id))
    setSelectedDemands(prevSelected => prevSelected.filter(id => id !== demandToDelete.id))
    setSnackbar({
      open: true,
      message: 'Talep başarıyla iptal edildi',
      severity: 'success'
    })
  }

  const handleBulkDelete = () => {
    if (selectedDemands.length === 0) return

    const essences = JSON.parse(localStorage.getItem('essences') || '[]')
    const updatedEssences = essences.map(essence => {
      const updatedDemands = essence.demands.filter(
        demand => !selectedDemands.includes(demand.id)
      )
      const removedDemands = essence.demands.filter(
        demand => selectedDemands.includes(demand.id)
      )
      const totalRemovedAmount = removedDemands.reduce((total, demand) => total + demand.amount, 0)
      
      return {
        ...essence,
        demands: updatedDemands,
        totalDemand: essence.totalDemand - totalRemovedAmount
      }
    })

    localStorage.setItem('essences', JSON.stringify(updatedEssences))
    setDemands(prevDemands => prevDemands.filter(demand => !selectedDemands.includes(demand.id)))
    setSelectedDemands([])
    setSnackbar({
      open: true,
      message: `${selectedDemands.length} talep başarıyla iptal edildi`,
      severity: 'success'
    })
  }

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedDemands(demands.map(demand => demand.id))
    } else {
      setSelectedDemands([])
    }
  }

  const handleSelect = (demandId) => {
    setSelectedDemands(prevSelected => {
      if (prevSelected.includes(demandId)) {
        return prevSelected.filter(id => id !== demandId)
      } else {
        return [...prevSelected, demandId]
      }
    })
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                Profil Bilgilerim
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.firstName} {userInfo.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.email}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationCityIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.city}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.district}, {userInfo.neighborhood}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ mr: 1, fontSize: 16 }} />
                    {userInfo.address}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="h5" component="div">
              Talep Geçmişim
            </Typography>
            {selectedDemands.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Seçilenleri Sil ({selectedDemands.length})
              </Button>
            )}
          </Box>
          <Paper elevation={3}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '4px 4px 0 0' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'right' }}>
                Toplam Tutar: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(demands.reduce((total, demand) => total + demand.price, 0))}
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDemands.length > 0 && selectedDemands.length === demands.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Esans Adı</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="right">Miktar (gr)</TableCell>
                    <TableCell align="right">Birim Fiyat (TL/gr)</TableCell>
                    <TableCell align="right">Tarih</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demands.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedDemands.includes(demand.id)}
                          onChange={() => handleSelect(demand.id)}
                        />
                      </TableCell>
                      <TableCell>{demand.essenceName}</TableCell>
                      <TableCell>{demand.category || '-'}</TableCell>
                      <TableCell align="right">{demand.amount}</TableCell>
                      <TableCell align="right">{demand.price}</TableCell>
                      <TableCell align="right">{new Date(demand.date).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDemandDelete(demand)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default ProfilePage