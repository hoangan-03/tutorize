export const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 ${bgColor} rounded-xl`}>{icon}</div>
      <div className="ml-4 flex flex-col items-start">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
