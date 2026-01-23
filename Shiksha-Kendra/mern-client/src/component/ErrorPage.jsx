import { useRouteError, Link, useLocation } from 'react-router-dom';

const ErrorPage = () => {
	const error = useRouteError();
	const location = useLocation();

	// Default error if none provided
	const errorStatus = error?.status || error?.statusText || 404;
	const errorMessage = error?.message || error?.data?.message || "Page not found";
	const is404 = errorStatus === 404 || errorStatus === 'Not Found' || !error;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
			<div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
				<h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
				<h2 className="text-2xl font-semibold text-gray-800 mb-4">
					{is404 ? '404 - Page Not Found' : 'Something went wrong'}
				</h2>
				<p className="text-gray-600 mb-2">
					{is404
						? "The page you're looking for doesn't exist."
						: errorMessage}
				</p>
				{location.pathname && (
					<p className="text-sm text-gray-500 mb-6">
						Path: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
					</p>
				)}
				<div className="space-x-4">
					<Link
						to="/"
						className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Go Home
					</Link>
					<button
						onClick={() => window.location.reload()}
						className="inline-block px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
					>
						Reload Page
					</button>
				</div>
				{(import.meta.env.DEV || import.meta.env.MODE === 'development') && error && (
					<details className="mt-6 text-left">
						<summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
						<pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
							{JSON.stringify(error, null, 2)}
						</pre>
					</details>
				)}
			</div>
		</div>
	);
};

export default ErrorPage;
