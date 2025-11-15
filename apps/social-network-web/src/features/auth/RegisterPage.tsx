import { Link, useNavigate } from "react-router-dom"
import { type RegisterSchemaUser } from '@repo/user-interfaces'
import {useForm, type SubmitHandler} from 'react-hook-form'
import { useRegisterUserMutation } from "./endpointsAuth/endpoints"
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';
import './styleForAuth/RegisterPage.css'
import logo from '../../upload_image/logo.png'

export const RegisterPage = () => {
    const {register, formState: {isValid, isSubmitting}, handleSubmit} = useForm<RegisterSchemaUser>({
        mode: 'onChange'
    })
    const [registerUser] = useRegisterUserMutation()
    const navigate = useNavigate()

    const onSubmit: SubmitHandler<RegisterSchemaUser> = async (data) => {
        try {
            console.log('we call method in RegisterPage');
            await registerUser(data).unwrap();
            navigate('/auth/login')
        } catch (error) {
            console.error('There is error at the RegsiterPage: ', error);
            
        }
    }

    return <>
    <img src={logo} alt="just logo" width={'100px'} height={'70px'}/>
    <div className='form-container-register'>
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <div className="containerInput">
                <div className="label-thing"><label htmlFor="login">Login</label></div>
                <div className="form-group">
                    <PersonIcon fontSize="small"/>
                    <input id="login" type='text' {...register('login', {required: "Login is required"})}
                    placeholder="Enter your Login"/>
                </div>
            </div>
            <div className="containerInput">
                <div className="label-thing"><label htmlFor="email">Email</label></div>
                <div className="form-group">
                    <AlternateEmailIcon fontSize="small"/>
                    <input id="email" type='email' {...register('email', {required: "Email is required"})}
                    placeholder="Enter your email"/>
                </div>
            </div>
            <div className="containerInput">
                <div className="label-thing"><label htmlFor='password'>Password</label></div>
                <div className="form-group">
                <LockOpenIcon fontSize="small"/>
                <input id= 'password' type="password" {...register('password', {required: 'Password is required'})}
                placeholder="Enter your password"/>
            </div>
            </div>
            <div className="containerInput">
                <div className="label-thing"><label htmlFor='password-confirm'>Password Confirm</label></div>
                <div className="form-group">
                <LockResetIcon fontSize="small"/>
                <input id= 'password-confirm' type="password" {...register('passwordConfirm', {required: 'Password is required'})}
                placeholder="Enter your password"/>
            </div>
            </div>
            <div className="buttons">
                <button type="submit" className="button-sign-up" disabled={!isValid || isSubmitting}>Sign Up</button>
            </div>
            <p className="signup">Do have an account? <Link to={'/auth/login'}>Sign In</Link></p>
        </form>
    </div>
    </>
}