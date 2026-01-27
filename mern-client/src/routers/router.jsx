import {
    createBrowserRouter,
    RouterProvider,
}from "react-router-dom";
import App from "../App";
import Home from "../home/Home";
import Shop from "../shop/Shop.jsx";
import Blog from "../component/Blog.jsx";
import SingleBook from "../shop/Singlebook.jsx";
import About from "../component/About.jsx";
import Cart from "../component/Cart.jsx"
import DashboardLayout from "../dashboard/DashboardLayout";
import Dashboard from "../dashboard/Dashboard";
import Upload from "../dashboard/Upload.jsx"
import ManageBook from "../dashboard/ManageBook.jsx"
import EditBook from "../dashboard/EditBook.jsx"
import Users from "../dashboard/Users.jsx";
import Signup from "../component/Signup.jsx"
import Login from "../component/Login.jsx"
import PrivateRoute from "../Privateroute/PrivateRoute.jsx";
import Logout from "../component/Logout.jsx";
import InspiringStories from "../component/InspiringStories.jsx";
import ErrorPage from "../component/ErrorPage.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/shop",
				element: <Shop />,
			},
			{
				path: "/blog",
				element: <Blog />,
			},
			{
				path: "/Blog",
				element: <Blog />,
			},
			{
				path: "/about",
				element: <About />,
			},
			{
				path: "/About",
				element: <About />,
			},
			{
				path: "/cart",
				element: <Cart />,
			},
			{
				path: "/Cart",
				element: <Cart />,
			},
			{
				path: "/inspiring-stories",
				element: <InspiringStories />,
			},
			{
				path: "/book/:id",
				element: <SingleBook />,
				loader: ({ params }) => fetch(`${API_BASE_URL}/book/${params.id}`),
			},
		],
	},
	{
		path: "/admin/dashboard",
		element: <DashboardLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: (
					<PrivateRoute>
						<Dashboard />
					</PrivateRoute>
				),
			},
			{
				path: "users",
				element: (
					<PrivateRoute>
						<Users />
					</PrivateRoute>
				),
			},
			{
				path: "Upload",
				element: (
					<PrivateRoute>
						<Upload />
					</PrivateRoute>
				),
			},
			{
				path: "ManageBook",
				element: (
					<PrivateRoute>
						<ManageBook />
					</PrivateRoute>
				),
			},
			{
				path: "EditBook/:id",
				element: (
					<PrivateRoute>
						<EditBook />
					</PrivateRoute>
				),
				loader: ({ params }) => fetch(`${API_BASE_URL}/book/${params.id}`),
			},
		],
	},
	{
		path: "/Sign-up",
		element: <Signup />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/login",
		element: <Login />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/Logout",
		element: <Logout />,
		errorElement: <ErrorPage />,
	},
	{
		path: "*",
		element: <ErrorPage />,
	},
]);
export default router;
