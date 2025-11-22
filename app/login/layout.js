// app/login/layout.js
export const metadata = {
  title: 'Login - DocFlow',
  description: 'Login to your DocFlow account',
};

export default function LoginLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}