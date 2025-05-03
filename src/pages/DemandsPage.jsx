import { useState, useEffect } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Collapse, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { useFirebase } from '../contexts/FirebaseContext';
import { demandService, essenceService } from '../firebase/services';

function DemandsPage() {
  const navigate = useNavigate();
  const [userDemands, setUserDemands] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const { user } = useFirebase();

  useEffect(() => {
    if (!user || !user.email || user.email !== 'admin@esans.com') {
      navigate('/home');
      return;
    }

    const unsubscribeDemands = demandService.subscribeToDemandsOver250((demands) => {
      const demandsMap = new Map();

      demands.forEach(demand => {
        if (!demandsMap.has(demand.userEmail)) {
          demandsMap.set(demand.userEmail, {
            userInfo: {
              email: demand.userEmail,
              name: demand.userEmail.split('@')[0], // Geçici olarak email'den isim oluşturuyoruz
            },
            demands: [],
            totalAmount: 0
          });
        }

        essenceService.getEssence(demand.essenceId).then(essence => {
          if (essence) {
            const demandWithPrice = {
              id: demand.id,
              essenceName: essence.name,
              essenceCode: essence.code,
              amount: demand.amount,
              date: demand.createdAt,
              price: essence.price,
              category: essence.category
            };

            const userDemand = demandsMap.get(demand.userEmail);
            userDemand.demands.push(demandWithPrice);
            userDemand.totalAmount += essence.price * demand.amount;

            // Map'i array'e çevirip state'i güncelliyoruz
            const userDemandsList = Array.from(demandsMap.values());
            userDemandsList.forEach(userData => {
              userData.demands.sort((a, b) => b.date - a.date);
            });
            setUserDemands(userDemandsList);
          }
        });
      });
    });

    return () => {
      unsubscribeDemands();
    };
  }, [user, navigate]);

  const handleExpandClick = (userEmail) => {
    setExpandedUser(expandedUser === userEmail ? null : userEmail);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" component="div" gutterBottom>
        Kesin Alım Talep Listesi
      </Typography>
      <List>
        {userDemands.map((userData) => (
          <Paper key={userData.userInfo.email} elevation={3} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem
              button
              onClick={() => handleExpandClick(userData.userInfo.email)}
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
                  secondary={userData.userInfo.email}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Paper elevation={1} sx={{ px: 2, py: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: 'primary.contrastText', fontWeight: 600 }}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(userData.totalAmount)}
                    </Typography>
                  </Paper>
                  <IconButton edge="end">
                    {expandedUser === userData.userInfo.email ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
            <Collapse in={expandedUser === userData.userInfo.email} timeout="auto" unmountOnExit>
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
  );
}

export default DemandsPage;