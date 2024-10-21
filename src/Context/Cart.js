import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BaseUrl } from "../Componentes/BaseUrl/base";
import { mediaContext } from "./MediaStore";

export const FetchCartContext = createContext();

export default function FetchCartProvider(props) {
    const notify = (msg, type) => {
        toast[type](msg, {
            autoClose: 1000,
            theme: 'dark',
            position: 'bottom-center'
        });
    };

    const [cart, setCart] = useState({ items: [] });
    const [numOfCart, setNumOfCart] = useState(0);
    const { userData } = useContext(mediaContext);
    const token = localStorage.getItem('token');

    const AddProductToCart = async (productId) => {
        try {
            await axios.post(`${BaseUrl}/carts/addProductToCart`, { productId }, {
                headers: { 'token': token }
            });
            console.log(productId)
            notify('Product Added To Cart', 'success');
            getProductCart(); 
        } catch (error) {
            const message = error.response?.data?.message || 'Error adding product to cart';
            console.error(message, error);
            notify(message, 'error');
        }
    };

    const getProductCart = async () => {
        try {
            const { data } = await axios.get(`${BaseUrl}/carts/getCartForUser`, {
                headers: { 'token': token }
            });
            setCart(data.cart);
            calculateNumOfCart(data.cart.items); 
            setNumOfCart(data.cart.items.length);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    const calculateNumOfCart = (items) => {
        const totalCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
        setNumOfCart(totalCount);
    };

    useEffect(() => {
        if (localStorage.getItem("token") && userData !== '') {
            getProductCart()
        }
    }, [userData])

    const deleteProductCart = async (productId) => {
        try {
            await axios.delete(`${BaseUrl}/carts/removeProductFromCart/${productId}`, {
                headers: { 'token': token }
            });
            setCart((prevCart) => {
                const updatedItems = prevCart.items.filter(item => item.productId._id !== productId);
                calculateNumOfCart(updatedItems); 
                return { ...prevCart, items: updatedItems };
            });
            notify('Product Deleted From Cart', 'success');
        } catch (error) {
            notify('Error deleting product from cart', 'error');
        }
    };

    const UpdateProductCart = async (productId, quantity) => {
        try {
            await axios.put(`${BaseUrl}/carts/updateProductQuantityInCart`, { productId, quantity }, {
                headers: { 'token': token }
            });
            notify(`Product ${quantity} updated`, 'success');
            getProductCart();
        } catch (error) {
            const message = error.response?.data?.msg || 'Error updating product quantity';
            notify(message, 'error');
        }
    };
    

    const clearCart = async () => {
        try {
            await axios.delete(`${BaseUrl}/carts/clearCart`, {
                headers: { 'token': token }
            });
            setCart({ items: [] });
            setNumOfCart(0);
            notify('Products cleared from cart', 'success');
        } catch (error) {
            notify('Error clearing cart', 'error');
        }
    };

    return (
        <FetchCartContext.Provider value={{
            AddProductToCart, cart, setCart, getProductCart,
            numOfCart, deleteProductCart, UpdateProductCart, clearCart
        }}>
            {props.children}
        </FetchCartContext.Provider>
    );
}























// import axios from "axios";
// import { createContext, useContext, useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { BaseUrl } from "../Componentes/BaseUrl/base";
// import { mediaContext } from "./MediaStore";

// export const FetchCartContext = createContext();

// export default function FetchCartProvider(props) {
//     const notify = (msg, type) => {
//         toast[type](msg, {
//             autoClose: 1000,
//             theme: 'dark',
//             position: 'bottom-center'
//         });
//     }

//     const [cart, setCart] = useState([]);
//     const [numOfCart, setNumOfCart] = useState(0);
//     const { userData, saveUserData } = useContext(mediaContext);
//     const [token, setToken] = useState(localStorage.getItem('token'));

//     // This should also be updated in places where the token is retrieved
//     const AddProductToCart = async (productId) => {
//         try {
//             await axios.post(`${BaseUrl}/carts/addProductToCart`, { productId }, {
//                 headers: { 'token': token }
//             });
//             notify('Product Added To Cart', 'success');
//             getProductCart();
//         } catch (error) {
//             console.error("Error adding product to cart:", error);
//             notify('Error adding product to cart', 'error');
//         }
//     };
    


//     const getProductCart = async () => {
//         try {
//             const { data } = await axios.get(`${BaseUrl}/carts/getCartForUser`, {
//                 headers: { 'token': token }
//             });
//             setCart(data.cart);
//             setNumOfCart(data.cart.items.length);  
//         } catch (error) {
//             console.error("Error fetching cart:", error);
//         }
//     };





//     useEffect(() => {
//         if (localStorage.getItem("token") && userData !== '') {
//             getProductCart()
//         }
//     }, [userData])

//     const deleteProductCart = async (productId) => {
//         try {
//             await axios.delete(`${BaseUrl}/carts/removeProductFromCart/${productId}`, {
//                 headers: { 'token': token }
//             });
//             notify('Product Deleted From Cart', 'success');
//             getProductCart();
//         } catch (error) {
//             console.error("Error deleting product from cart:", error);
//             notify('Error deleting product from cart', 'error');
//         }
//     };

//     const UpdateProductCart = async (productId, count, type) => {
//         try {
//             await axios.put(`${BaseUrl}/carts/updateProductQuantityInCart/${productId}`, { count }, {
//                 headers: { 'token': token }
//             });
            
//         notify(`Product count ${type === 'increase' ? 'Increased' : 'Decreased'}`, 'success');
//             getProductCart();

//         } catch (error) {
//             console.error("Error updating product quantity:", error);
//             notify('Error updating product quantity', 'error');
//         }
//     };

//     const clearCart = async () => {
//         try {
//             await axios.delete(`${BaseUrl}/carts/clearCart`, {
//                 headers: { 'token': token }
//             });
//             setCart([]);
//             notify('Products cleared from cart', 'success');
//         } catch (error) {
//             console.error("Error clearing cart:", error);
//             notify('Error clearing cart', 'error');
//         }
//     };

//     return (
//         <FetchCartContext.Provider value={{
//             AddProductToCart, setNumOfCart, cart, setCart,getProductCart,
//             numOfCart, deleteProductCart, UpdateProductCart, clearCart
//         }}>
//             {props.children}
//         </FetchCartContext.Provider>
//     );
// }
