import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
    const navigate = useNavigate()
    const [data, setData] = useState({ email: '', password: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setData((currentData) => ({ ...currentData, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const res = await axios.post('http://localhost:5000/api/admin/login', data)
            if (res.data.msg === 'Sucess') {
                localStorage.setItem('name', res.data.name)
                localStorage.setItem('role', res.data.role)
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('adminId', res.data.adminId)
                navigate('/dashboard')
            } else {
                setError(res.data.msg || 'Email or password is incorrect.')
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Unable to connect to the server. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="admin-login-page">
            <section className="admin-login-panel" aria-labelledby="admin-login-title">
                <div className="admin-login-mark" aria-hidden="true">SP</div>
                <p className="admin-login-eyebrow">SoftPro Innovation</p>
                <h1 id="admin-login-title">Admin portal</h1>
                <p className="admin-login-intro">Sign in to manage your store, orders, and customers.</p>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="admin-field">
                        <label htmlFor="admin-email">Email address</label>
                        <input
                            id="admin-email"
                            type="email"
                            name="email"
                            placeholder="admin@example.com"
                            value={data.email}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div className="admin-field">
                        <label htmlFor="admin-password">Password</label>
                        <input
                            id="admin-password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="admin-login-error" role="alert">{error}</p>}

                    <button className="admin-login-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign in to dashboard'}
                    </button>
                </form>
                <p className="admin-login-footer">Authorized administrators only</p>
            </section>
        </main>
    )
}

export default AdminLogin