import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TABLE_TEMPLATES } from '../lib/tableTemplates';
import { 
  ArrowLeft, LayoutDashboard, Folders, Check,
  LineChart as LineChartIcon, BarChart2, PieChart as PieChartIcon, 
  Activity, List, Database, Table, Map, Maximize, Donut 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'animated', name: 'Animated Charts', icon: <Activity className="w-4 h-4" /> },
  { id: 'structural', name: 'Structural Metrics', icon: <Table className="w-4 h-4" /> },
  { id: 'radial', name: 'Radial Displays', icon: <PieChartIcon className="w-4 h-4" /> },
  { id: 'tables', name: 'Data Tables', icon: <Database className="w-4 h-4" /> },
];

const CHARTS = [
  ...TABLE_TEMPLATES, // assuming there are a few here
  // ANIMATED CHARTS (15 variants)
  { category: 'animated', title: 'Revenue Growth', type: 'line', color: '#3B82F6', iconBg: 'bg-blue-100', text: 'text-blue-600', icon: <LineChartIcon /> },
  { category: 'animated', title: 'Monthly Sales', type: 'bar', color: '#10B981', iconBg: 'bg-emerald-100', text: 'text-emerald-600', icon: <BarChart2 /> },
  { category: 'animated', title: 'Project Volume', type: 'area', color: '#F59E0B', iconBg: 'bg-amber-100', text: 'text-amber-600', icon: <Activity /> },
  { category: 'animated', title: 'Composed Data', type: 'composed', color: '#D946EF', iconBg: 'bg-fuchsia-100', text: 'text-fuchsia-600', icon: <Database /> },
  { category: 'animated', title: 'Active Users', type: 'line', color: '#EC4899', iconBg: 'bg-pink-100', text: 'text-pink-600', icon: <LineChartIcon /> },
  { category: 'animated', title: 'Server Load', type: 'area', color: '#EF4444', iconBg: 'bg-red-100', text: 'text-red-600', icon: <Activity /> },
  { category: 'animated', title: 'Task Completion', type: 'bar', color: '#06B6D4', iconBg: 'bg-cyan-100', text: 'text-cyan-600', icon: <BarChart2 /> },
  { category: 'animated', title: 'User Retention', type: 'line', color: '#8B5CF6', iconBg: 'bg-purple-100', text: 'text-purple-600', icon: <LineChartIcon /> },
  { category: 'animated', title: 'Ad Conversion', type: 'area', color: '#6366f1', iconBg: 'bg-indigo-100', text: 'text-indigo-600', icon: <Activity /> },
  { category: 'animated', title: 'Email Open Rate', type: 'line', color: '#14b8a6', iconBg: 'bg-teal-100', text: 'text-teal-600', icon: <LineChartIcon /> },
  { category: 'animated', title: 'Site Traffic Daily', type: 'bar', color: '#f43f5e', iconBg: 'bg-rose-100', text: 'text-rose-600', icon: <BarChart2 /> },
  { category: 'animated', title: 'Quarterly Revenue', type: 'area', color: '#84cc16', iconBg: 'bg-lime-100', text: 'text-lime-600', icon: <Activity /> },
  { category: 'animated', title: 'Bounce Rate', type: 'line', color: '#f59e0b', iconBg: 'bg-amber-100', text: 'text-amber-600', icon: <LineChartIcon /> },
  { category: 'animated', title: 'Cart Abandonment', type: 'bar', color: '#ef4444', iconBg: 'bg-red-100', text: 'text-red-600', icon: <BarChart2 /> },
  { category: 'animated', title: 'NPS Score Trend', type: 'line', color: '#0ea5e9', iconBg: 'bg-sky-100', text: 'text-sky-600', icon: <LineChartIcon /> },

  // STRUCTURAL METRICS (15 variants)
  { category: 'structural', title: 'Performance KPIs', type: 'kpi', color: '#10B981', iconBg: 'bg-emerald-100', text: 'text-emerald-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Financial Overview', type: 'kpi', color: '#3B82F6', iconBg: 'bg-blue-100', text: 'text-blue-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Marketing Pulse', type: 'kpi', color: '#EC4899', iconBg: 'bg-pink-100', text: 'text-pink-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'SaaS Metrics', type: 'kpi', color: '#8B5CF6', iconBg: 'bg-purple-100', text: 'text-purple-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Logistics Data', type: 'kpi', color: '#F59E0B', iconBg: 'bg-amber-100', text: 'text-amber-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Support Tickets', type: 'kpi', color: '#14B8A6', iconBg: 'bg-teal-100', text: 'text-teal-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'System Health', type: 'kpi', color: '#EF4444', iconBg: 'bg-red-100', text: 'text-red-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'E-commerce Stats', type: 'kpi', color: '#0EA5E9', iconBg: 'bg-sky-100', text: 'text-sky-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'HR Headcount', type: 'kpi', color: '#6366f1', iconBg: 'bg-indigo-100', text: 'text-indigo-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Project ROI', type: 'kpi', color: '#84cc16', iconBg: 'bg-lime-100', text: 'text-lime-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Sales Funnel', type: 'kpi', color: '#d946ef', iconBg: 'bg-fuchsia-100', text: 'text-fuchsia-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Inventory Levels', type: 'kpi', color: '#06b6d4', iconBg: 'bg-cyan-100', text: 'text-cyan-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Social Engagement', type: 'kpi', color: '#f43f5e', iconBg: 'bg-rose-100', text: 'text-rose-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Cost Analysis', type: 'kpi', color: '#f97316', iconBg: 'bg-orange-100', text: 'text-orange-600', icon: <LayoutDashboard /> },
  { category: 'structural', title: 'Security Audits', type: 'kpi', color: '#334155', iconBg: 'bg-slate-200', text: 'text-slate-800', icon: <LayoutDashboard /> },

  // RADIAL DISPLAYS (15 variants)
  { category: 'radial', title: 'Market Share', type: 'pie', color: '#8B5CF6', iconBg: 'bg-purple-100', text: 'text-purple-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Demographics', type: 'pie', color: '#F97316', iconBg: 'bg-orange-100', text: 'text-orange-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Traffic Sources', type: 'pie', color: '#84CC16', iconBg: 'bg-lime-100', text: 'text-lime-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Feature Usage', type: 'pie', color: '#0EA5E9', iconBg: 'bg-sky-100', text: 'text-sky-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Radar Stats', type: 'radar', color: '#14B8A6', iconBg: 'bg-teal-100', text: 'text-teal-600', icon: <Maximize /> },
  { category: 'radial', title: 'Radial Metrics', type: 'radial', color: '#F97316', iconBg: 'bg-orange-100', text: 'text-orange-600', icon: <Activity /> },
  { category: 'radial', title: 'Browser Usage', type: 'pie', color: '#3B82F6', iconBg: 'bg-blue-100', text: 'text-blue-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Device Breakdown', type: 'pie', color: '#10B981', iconBg: 'bg-emerald-100', text: 'text-emerald-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Skill Radar', type: 'radar', color: '#EC4899', iconBg: 'bg-pink-100', text: 'text-pink-600', icon: <Maximize /> },
  { category: 'radial', title: 'Budget Allocation', type: 'pie', color: '#F59E0B', iconBg: 'bg-amber-100', text: 'text-amber-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Competitor Radar', type: 'radar', color: '#6366F1', iconBg: 'bg-indigo-100', text: 'text-indigo-600', icon: <Maximize /> },
  { category: 'radial', title: 'Energy Consumption', type: 'radial', color: '#06B6D4', iconBg: 'bg-cyan-100', text: 'text-cyan-600', icon: <Activity /> },
  { category: 'radial', title: 'Goal Progress', type: 'radial', color: '#EF4444', iconBg: 'bg-red-100', text: 'text-red-600', icon: <Activity /> },
  { category: 'radial', title: 'Time Allocation', type: 'pie', color: '#D946EF', iconBg: 'bg-fuchsia-100', text: 'text-fuchsia-600', icon: <PieChartIcon /> },
  { category: 'radial', title: 'Risk Factors', type: 'radar', color: '#f43f5e', iconBg: 'bg-rose-100', text: 'text-rose-600', icon: <Maximize /> },
];

export function ChartsLibrary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeCategory, setActiveCategory] = React.useState('animated');

  const handleSelectChart = (chart: any) => {
    if (chart.html) {
      localStorage.setItem('pending_table_element', chart.html);
    } else {
      localStorage.setItem('pending_chart_element', JSON.stringify({
        title: chart.title,
        type: chart.type,
        color: chart.color
      }));
    }
    navigate(`/doc/${id}`);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F9FAFB] overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm relative z-30">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(`/doc/${id}`)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="flex flex-col">
             <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 leading-none flex items-center gap-2">
                <Folders className="w-5 h-5 text-emerald-500" />
                Syntax Library
             </h1>
             <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Metrics & Data Models</p>
           </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
           <div className="p-4 border-b border-gray-100 opacity-60">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-2">Folders</span>
           </div>
           <div className="p-2 flex flex-col gap-1">
             {CATEGORIES.map(category => (
               <button
                 key={category.id}
                 onClick={() => setActiveCategory(category.id)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                   activeCategory === category.id 
                     ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm'
                     : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                 }`}
               >
                 {React.cloneElement(category.icon, { 
                   className: `w-4 h-4 ${activeCategory === category.id ? 'text-emerald-500' : 'text-gray-400'}` 
                 })}
                 {category.name}
               </button>
             ))}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative isolate">
            <div className="max-w-5xl mx-auto">
               <div className="mb-8 border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {CATEGORIES.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Select a model to deploy into your document.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {CHARTS.filter(c => c.category === activeCategory).map((chart: any, i) => (
                   <button
                     key={i}
                     onClick={() => handleSelectChart(chart)}
                     className="group flex flex-col p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300 transition-all text-left relative overflow-hidden"
                   >
                     {/* Decorative background circle */}
                     <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-transform group-hover:scale-150`} style={{ backgroundColor: chart.color }}></div>
                     
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${chart.iconBg} ${chart.text} shrink-0`}>
                        {chart.icon ? React.cloneElement(chart.icon, { className: 'w-6 h-6' }) : <Table className="w-6 h-6"/>}
                     </div>
                     
                     <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{chart.title}</h3>
                     <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">{chart.type} Variant</p>
                     
                     <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-gray-400 transition-colors group-hover:text-emerald-600 flex items-center gap-1">
                          DEPLOY MODEL <ArrowLeft className="w-3 h-3 rotate-180" />
                       </span>
                     </div>
                   </button>
                 ))}
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
