import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { HiChartPie, HiOutlineCloudUpload, HiOutlineRefresh, HiOutlineSwitchHorizontal, HiUserGroup } from "react-icons/hi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Dashboard = () => {
	const navigate = useNavigate();
	const [stats, setStats] = useState({
		resourceCount: 0,
		uploadCount: 0,
		userCount: 0,
	});
	const [recentBooks, setRecentBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const formatDate = (value) => {
		if (!value) return "—";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "—";
		return new Intl.DateTimeFormat("en", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	const fetchDashboard = async () => {
		setLoading(true);
		setError("");

		try {
			const [statsRes, booksRes] = await Promise.all([fetch(`${API_BASE_URL}/site-stats`), fetch(`${API_BASE_URL}/all-books`)]);

			if (!statsRes.ok) {
				throw new Error("Could not load stats");
			}
			if (!booksRes.ok) {
				throw new Error("Could not load resources");
			}

			const statsData = await statsRes.json();
			const booksData = await booksRes.json();
			const normalizedBooks = Array.isArray(booksData) ? booksData : [];

			normalizedBooks.sort((a, b) => {
				const aDate = new Date(a.createdAt || 0).getTime();
				const bDate = new Date(b.createdAt || 0).getTime();
				return bDate - aDate;
			});

			setRecentBooks(normalizedBooks.slice(0, 5));
			setStats({
				resourceCount: statsData.resourceCount ?? 0,
				uploadCount: normalizedBooks.length,
				userCount: statsData.userCount ?? 0,
			});
		} catch (err) {
			setError(err?.message || "Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboard();
	}, []);

	const statCards = useMemo(
		() => [
			{
				label: "Total Uploads",
				value: stats.uploadCount,
				icon: <HiOutlineCloudUpload className='h-6 w-6 text-blue-600' />,
				accent: "bg-blue-50 border-blue-100",
			},
			{
				label: "Downloads",
				value: stats.resourceCount,
				icon: <HiOutlineSwitchHorizontal className='h-6 w-6 text-emerald-600' />,
				accent: "bg-emerald-50 border-emerald-100",
			},
			{
				label: "Active Users",
				value: stats.userCount,
				icon: <HiUserGroup className='h-6 w-6 text-purple-600' />,
				accent: "bg-purple-50 border-purple-100",
			},
			{
				label: "Health",
				value: "OK",
				icon: <HiChartPie className='h-6 w-6 text-gray-700' />,
				accent: "bg-gray-50 border-gray-200",
			},
		],
		[stats]
	);

	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<p className='text-sm font-medium text-gray-500'>Admin overview</p>
					<h1 className='text-3xl font-semibold text-gray-900'>Dashboard</h1>
				</div>
				<div className='flex flex-wrap gap-3'>
					<Button onClick={() => navigate("/admin/dashboard/Upload")} className='bg-blue-700'>
						Upload resource
					</Button>
					<Button onClick={() => navigate("/admin/dashboard/ManageBook")} color='light'>
						Manage resources
					</Button>
					<Button color='light' onClick={fetchDashboard} aria-label='Refresh dashboard'>
						<HiOutlineRefresh className='mr-2 h-5 w-5' /> Refresh
					</Button>
				</div>
			</div>

			{error && <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</div>}

			{loading ? (
				<div className='flex justify-center py-16'>
					<Spinner size='xl' />
				</div>
			) : (
				<>
					<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
						{statCards.map((card) => (
							<div key={card.label} className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm ${card.accent}`}>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-inner'>{card.icon}</div>
								<div>
									<p className='text-sm font-medium text-gray-600'>{card.label}</p>
									<p className='text-2xl font-semibold text-gray-900'>{card.value}</p>
								</div>
							</div>
						))}
					</div>

					<div className='rounded-xl border bg-white p-4 shadow-sm'>
						<div className='mb-4 flex items-center justify-between gap-3'>
							<div>
								<h2 className='text-xl font-semibold text-gray-900'>Recent uploads</h2>
								<p className='text-sm text-gray-500'>Last 5 resources added to the library</p>
							</div>
							<Badge color='gray' className='px-3 py-1 text-sm'>
								Total: {stats.uploadCount}
							</Badge>
						</div>

						{recentBooks.length === 0 ? (
							<p className='py-6 text-center text-sm text-gray-500'>No resources uploaded yet.</p>
						) : (
							<div className='overflow-x-auto'>
								<Table>
									<TableHead>
										<TableHeadCell>#</TableHeadCell>
										<TableHeadCell>Title</TableHeadCell>
										<TableHeadCell>Category</TableHeadCell>
										<TableHeadCell>Uploaded</TableHeadCell>
										<TableHeadCell>Actions</TableHeadCell>
									</TableHead>
									<TableBody className='divide-y'>
										{recentBooks.map((book, index) => (
											<TableRow key={book._id || index} className='bg-white'>
												<TableCell>{index + 1}</TableCell>
												<TableCell className='font-medium text-gray-900'>{book.bookTitle}</TableCell>
												<TableCell>
													<Badge color='blue' className='capitalize'>
														{book.category || "Uncategorized"}
													</Badge>
												</TableCell>
												<TableCell className='text-gray-600'>{formatDate(book.createdAt)}</TableCell>
												<TableCell>
													<div className='flex gap-3'>
														{book._id && (
															<Link
																to={`/admin/dashboard/EditBook/${book._id}`}
																className='text-sm font-medium text-blue-700 hover:underline'>
																Edit
															</Link>
														)}
														<Link
															to='/admin/dashboard/ManageBook'
															className='text-sm font-medium text-gray-600 hover:underline'>
															Details
														</Link>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default Dashboard;
