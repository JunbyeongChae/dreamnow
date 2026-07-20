import { createBrowserRouter } from 'react-router-dom'

import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import MainPage from './pages/MainPage'
import MenuDetailPage from './pages/MenuDetailPage'
import MenuPage from './pages/MenuPage'
import SignupPage from './pages/SignupPage'
import SupportPage from './pages/SupportPage'

export const router = createBrowserRouter([
  { path: '/', element: <MainPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/menu', element: <MenuPage /> },
  { path: '/menu/:id', element: <MenuDetailPage /> },
  { path: '/support', element: <SupportPage /> },
])
