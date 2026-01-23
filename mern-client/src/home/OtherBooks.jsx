
import {useState , useEffect} from 'react'
import BookCards  from '../component/BookCards';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OtherBooks = () =>{
    const [books , setBooks] = useState([]);
    useEffect(()=>{
    fetch(`${API_BASE_URL}/all-books`).then(res=>res.json()).then(data=>setBooks(data.slice(
        0,8
    )))
    },[])


    return(

            <div className='pt-20 px-4'><BookCards books={books} headline="Other Books"/>
            </div>

    )
}
export default OtherBooks