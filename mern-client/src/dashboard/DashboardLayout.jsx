import React from "react";
import { Outlet } from "react-router";
import SideBar from "./SideBar";

const DashboardLayout = () => {
	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-8'>
				<div className='md:w-64 lg:w-72'>
					<SideBar />
				</div>
				<main className='flex-1'>
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
