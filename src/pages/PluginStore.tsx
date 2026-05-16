import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileArchive, FileText, FileSpreadsheet, Presentation, Sparkles, FolderArchive, ArrowRight } from 'lucide-react';
import { usePremium } from '../context/PremiumContext';

const TOOLS = [
  { id: 'vision-extractor', name: 'Autonomous Vision Extractor', description: 'Extract text from images using advanced local OCR.', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50', route: '/doc/:id/tools/vision' },
];

export default function PluginStore() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleAction } = usePremium();

  const handleToolClick = (toolRoute: string | undefined) => {
     handleAction('plugins', () => {
       if (toolRoute) {
         navigate(toolRoute.replace(':id', id || ''));
       } else {
         alert("Tool currently under construction.");
       }
     });
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}`)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Productivity Tools
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Powerful Tools & Plugins
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to transform your documents, spreadsheets, and presentations. These tools are natively integrated for your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map(tool => (
            <div 
              key={tool.id}
              onClick={() => handleToolClick(tool.route)}
              className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-100 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${tool.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`w-7 h-7 ${tool.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {tool.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                Access Tool <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
