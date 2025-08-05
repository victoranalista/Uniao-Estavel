export default function DashboardPage(props: {
  searchParams: Promise<{ q: string; offset: string }>;
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-7xl">Napoleão</h1>
    </div>
  );
}