import React, {useState , useEffect} from "react";
import BookCards from "../component/BookCards";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const BestSellerBook = () =>{
    const [books , setBooks] = useState([]);
    useEffect(()=>{
    fetch(`${API_BASE_URL}/all-books`).then(res=>res.json()).then(data=>setBooks(data.slice(
        0,6
    )))
    },[])


    return(

            <div ><BookCards books={books} headline="Most Downloaded Resources"/>
            </div>

    )
}
export default BestSellerBook