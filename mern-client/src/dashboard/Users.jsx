import React, { useContext, useMemo } from "react";
import { Card, Badge } from "flowbite-react";
import { HiUser, HiMail, HiCheckCircle, HiOutlineClock } from "react-icons/hi";
import { AuthContext } from "../context/AuthProvider";

const Users = () => {
	const { user } = useContext(AuthContext);

	const userMeta = useMemo(() => {
		if (!user) return null;
		const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
		const lastSignIn = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null;
		return {
			name: user.displayName || "Authenticated User",
			email: user.email || "Not provided",
			photo: user.photoURL,
			emailVerified: !!user.emailVerified,
			created,
			lastSignIn,
		};
	}, [user]);

	const formatDate = (value) => {
		if (!value) return "—";
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return "—";
		return new Intl.DateTimeFormat("en", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(d);
	};

	return (
		<div className='space-y-4'>
			<div>
				<p className='text-sm font-medium text-gray-500'>Access control</p>
				<h1 className='text-3xl font-semibold text-gray-900'>Users</h1>
			</div>

			{!userMeta ? (
				<Card className='border-dashed border-2'>
					<h2 className='text-xl font-semibold text-gray-800'>No user signed in</h2>
					<p className='text-sm text-gray-600'>Sign in to view your profile details.</p>
				</Card>
			) : (
				<Card className='flex flex-col gap-4 md:flex-row md:items-center'>
					<div className='flex items-center gap-4'>
						<div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100'>
							{userMeta.photo ? (
								<img src={userMeta.photo} alt={userMeta.name} className='h-full w-full object-cover' />
							) : (
								<HiUser className='h-8 w-8 text-gray-500' />
							)}
						</div>
						<div>
							<div className='flex items-center gap-2'>
								<h2 className='text-xl font-semibold text-gray-900'>{userMeta.name}</h2>
								{userMeta.emailVerified && <Badge color='success'>Verified</Badge>}
							</div>
							<p className='flex items-center gap-2 text-sm text-gray-600'>
								<HiMail className='h-4 w-4' /> {userMeta.email}
							</p>
						</div>
					</div>

					<div className='flex flex-wrap gap-4 text-sm text-gray-700'>
						<div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
							<HiCheckCircle className='h-5 w-5 text-emerald-600' />
							<span>Email status: {userMeta.emailVerified ? "Verified" : "Not verified"}</span>
						</div>
						<div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
							<HiOutlineClock className='h-5 w-5 text-blue-600' />
							<span>Joined: {formatDate(userMeta.created)}</span>
						</div>
						<div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
							<HiOutlineClock className='h-5 w-5 text-indigo-600' />
							<span>Last sign in: {formatDate(userMeta.lastSignIn)}</span>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
};

export default Users;
