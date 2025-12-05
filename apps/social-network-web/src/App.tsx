import type React from 'react'
import './App.css'
import { matchPath, Navigate, Route, Routes, useLocation, Outlet } from 'react-router-dom'
import { useAppSeletctor } from './main-app-settings/main-hooks'
import { useState } from 'react'
import { SideBar } from './features/sideBar/sidebar-com'
import { LoginPage } from './features/auth/AuthLoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import pathRules from './some-settings/pathUrls'
import { AuthLayoutSide } from './features/auth/secondBlockRAndLPage'


export const ProtectedRoutes: React.FC = () => {
  const currentAuthUser = useAppSeletctor(state => state.auth.currentAuthUser)
  const currentAccessToken = useAppSeletctor(state => state.token.currentValue?.accessToken)

  if (!currentAuthUser || !currentAccessToken) {
    return <Navigate to={'/auth/login'} replace></Navigate>
  } 

  return <Outlet/>
}


export const LayoutFunction: React.FC = () => {
    const [open, setOpen] = useState(false)

    const location = useLocation()
    let resultPath: string = ''

    const matchedRules = pathRules.find((path) => {
      if (path.exact) {
        return path.pattern === location.pathname
      }
      return matchPath({path: path.pattern, end: false}, location.pathname) !== null
    })

    resultPath = matchedRules?.className || 'default-layout'

    return <div className={resultPath}>
      {
       !matchedRules?.hideSideBar ? <SideBar open={open} setOpen={setOpen}/> : <AuthLayoutSide/>
      }
      <div className='main-content'><Outlet/></div>
    </div>
}

function App() {

  return (
      <Routes>
        <Route element={<LayoutFunction/>}>
          <Route path='auth/login' element={<LoginPage/>}></Route>
          <Route path='auth/register' element={<RegisterPage/>}></Route>
          <Route element={<ProtectedRoutes/>}>
            <Route></Route>  
          </Route>
        </Route>
      </Routes>
  )
}

export default App
