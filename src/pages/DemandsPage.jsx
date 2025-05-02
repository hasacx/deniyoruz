import { useState, useEffect } from 'react'
import { Container, Typography, Paper, List, ListItem, ListItemText, Collapse, IconButton, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'

function DemandsPage() {
  const navigate = useNavigate()
  const [userDemands, setUserDemands] = useState([])
  const [expandedUser, setExpandedUser] = useState(null)

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.email !== 'admin@esans.com') {
      navigate('/home')
      return
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const essences = JSON.parse(localStorage.getItem('essences') || '[]')
    const demandsMap = new Map()

    essences.forEach(essence => {
      if (essence.demands && essence.totalDemand >= 250) {
        essence.demands.forEach(demand => {
          const user = users.find(u => `${u.firstName} ${u.lastName}` === demand.userName)
          if (user) {
            if (!demandsMap.has(demand.userName)) {
              demandsMap.set(demand.userName, {
                userInfo: {
                  name: demand.userName,
                  phone: user.phone,
                  city: user.city,
                  district: user.district,
                  neighborhood: user.neighborhood,
                  address: user.address
                },
                demands: [],
                totalAmount: 0
              })
            }
            const demandWithPrice = {
              id: demand.id,
              essenceName: essence.name,
              essenceCode: essence.code,
              amount: demand.amount,
              date: demand.date,
              price: essence.price,
              category: essence.category
            }
            demandsMap.get(demand.userName).demands.push(demandWithPrice)
            demandsMap.get(demand.userName).totalAmount += essence.price
          }
        })
      }
    })

    const userDemandsList = Array.from(demandsMap.values())
    userDemandsList.forEach(userData => {
      userData.demands.sort((a, b) => new Date(b.date) - new Date(a.date))
    })
    setUserDemands(userDemandsList)
  }, [])

  const handleExpandClick = (userName) => {
    setExpandedUser(expandedUser === userName ? null : userName)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Kesin Alım Talep Listesi
      </Typography>
      <List>
        {userDemands.map((userData) => (
          <Paper key={userData.userInfo.name} elevation={3} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem
              button
              onClick={() => handleExpandClick(userData.userInfo.name)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ListItemText
                  primary={userData.userInfo.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {userData.userInfo.phone}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {`${userData.userInfo.city} / ${userData.userInfo.district} / ${userData.userInfo.neighborhood}`}
                        <br />
                        {userData.userInfo.address}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Paper elevation={1} sx={{ px: 2, py: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(userData.totalAmount)}
                    </Typography>
                  </Paper>
                  <IconButton edge="end">
                    {expandedUser === userData.userInfo.name ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
            <Collapse in={expandedUser === userData.userInfo.name} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem sx={{ pl: 4, pr: 4, pt: 1, pb: 1, display: 'flex', flexDirection: 'row', gap: 2, borderBottom: '2px solid rgba(0, 0, 0, 0.12)' }}>
                  <Typography variant="subtitle2" sx={{ flex: 2, fontWeight: 600 }}>
                    Esans Adı
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                    Kategori
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    Miktar
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    Birim Fiyat
                  </Typography>
                  <Typography variant="subtitle2" sx={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>
                    Tarih
                  </Typography>
                </ListItem>
                {userData.demands.map((demand) => (
                  <ListItem key={demand.id} sx={{ pl: 4, pr: 4, pt: 1, pb: 1, display: 'flex', flexDirection: 'row', gap: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <Typography variant="body2" sx={{ flex: 2 }}>
                      {demand.essenceName} ({demand.essenceCode})
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {demand.category || '-'}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>
                      {demand.amount} gr
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'center' }}>
                      {demand.price} TL/gr
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right' }}>
                      {new Date(demand.date).toLocaleDateString('tr-TR')}
                    </Typography>
                  </ListItem>
                ))}
                <ListItem sx={{ pl: 4, pr: 4, pt: 2, pb: 2, bgcolor: 'primary.main', mt: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                          fontWeight: 600,
                          textAlign: 'right',
                          color: 'primary.contrastText'
                        }}
                      >
                        Toplam Tutar: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(userData.totalAmount)}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Collapse>
          </Paper>
        ))}
      </List>
    </Container>
  )
}

export default DemandsPage