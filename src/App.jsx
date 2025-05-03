import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import UsersPage from './pages/UsersPage'
import DemandsPage from './pages/DemandsPage'
import Dashboard from './components/Dashboard'
import { useFirebase } from './contexts/FirebaseContext'
import { AppBar, Toolbar, Typography, Button, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, useMediaQuery } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Person, ExitToApp, Dashboard as DashboardIcon, AdminPanelSettings, Group, ListAlt, Menu as MenuIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { authService } from './firebase/services'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useFirebase()
  const isAdmin = user?.email === 'admin@esans.com'
  const isLoginPage = ['/login', '/register', '/'].includes(location.pathname)

  if (isLoginPage) return null

  const menuItems = [
    { text: 'Ana Sayfa', icon: <Home />, path: '/home' },
    { text: 'Profilim', icon: <Person />, path: '/profile' },
    ...(isAdmin ? [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Yönetici Paneli', icon: <AdminPanelSettings />, path: '/admin' },
      { text: 'Kullanıcı Yönetimi', icon: <Group />, path: '/users' },
      { text: 'Talep Listesi', icon: <ListAlt />, path: '/demands' },
    ] : [])
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error)
    }
  }

  const drawer = (
    <>
      <Toolbar sx={{ 
        justifyContent: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: '64px !important'
      }}>
        <Typography variant="h6" noWrap component="div" color="primary">
          Sipariş Takip
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path)
              if (isMobile) handleDrawerToggle()
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Çıkış Yap" />
        </ListItem>
      </List>
    </>
  )

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: `240px` },
          display: { sm: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sipariş Takip
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  )
}

function App() {
  const { user, loading } = useFirebase()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user && ['/login', '/register', '/'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: '#f5f7fb',
          display: 'flex',
          flexDirection: 'column',
          mt: { xs: '64px', sm: 0 }
        }}
      >
        <Toolbar sx={{ display: { sm: 'none' } }} />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Navigate to="/home" />} />
          <Route path="/register" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/demands" element={<DemandsPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App