import React from 'react'
import {useState} from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom"
const AdminLogin = () => {
    const navigate =useNaviagte(); 
    const [data,setData] = useState({
        email:'',
        password:''
    })
    const handleChange = (e)=>{
        setData(()=>({...data,[e.target.name]:e.target.value}))
    }
    //submit function
    const handleSubmit = async(e)=>{
        try{
            e.preventDefault();
            const res = await axios.post('http://localhost:5000/api/admin/login',data);
            if(res.data.msg=="Sucess"){
                // console.log(res);
                localStorage.setItem("name",res.data.name)
                   localStorage.setItem("role",res.data.role)
                      localStorage.setItem("token",res.data.token)
                         localStorage.setItem("adminId",res.data.adminId)
                         Navigate('/admin/dashboard')
                       

                alert("successfully logged In")
            }else{
                console.log("sorry");
                alert(res);
            }
         

        }catch(er){
            console.log(er);
            alert("Server error")
        }
    } 
  return (
            <div>
                <form onSubmit={handleSubmit}>
                    Enter EMAIL:
                    <input type="email" name='email' onChange={handleChange}/>
                    <br/>
                    Enter PASSWORD:
                    <input type="password" name='password' onChange={handleChange}/><br/>
                    <input  type="submit"/>
                    <br/>

                </form>
            </div>
  )
}

export default AdminLogin