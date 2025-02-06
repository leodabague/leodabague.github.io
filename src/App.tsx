import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Cpu } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Item {
  CPU: string;
  Manufacturer: string;
  RAM: number;
  GPU: string;
  VRAM: string;
  LLM: string;
  Parameters: string;
  "Model Size": string;
  Performance: number;
  timeFor1kTokens: string;
}

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

interface FiltersProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  modelOptions: string[];
}

interface ComparisonTableProps {
  data: Item[];
  sortData: (key: keyof Item) => void;
  getSortIcon: (key: keyof Item) => React.ReactNode;
  getPerformanceColor: (performance: number) => string;
}

// Componente do botão de filtro
const FilterButton: React.FC<FilterButtonProps> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
      ${isSelected 
        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
  >
    {label}
  </button>
);

const Filters: React.FC<FiltersProps> = ({ selectedModel, setSelectedModel, modelOptions }) => (
  <div className="flex flex-wrap gap-2">
    <FilterButton
      label="Todos os Modelos"
      isSelected={selectedModel === 'all'}
      onClick={() => setSelectedModel('all')}
    />
    {modelOptions.map((model: string) => (
      <FilterButton
        key={model}
        label={model}
        isSelected={selectedModel === model}
        onClick={() => setSelectedModel(model)}
      />
    ))}
  </div>
);

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, sortData, getSortIcon, getPerformanceColor }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th colSpan={4} className="p-2 text-center bg-blue-50 border-b border-r border-gray-200 font-medium">Especificações Setup</th>
          <th colSpan={2} className="p-2 text-center bg-purple-50 border-b border-r border-gray-200 font-medium">LLM</th>
          <th colSpan={2} className="p-2 text-center bg-green-50 border-b border-gray-200 font-medium">Performance</th>
        </tr>
        <tr className="bg-gray-100">
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('CPU')}>
            <Cpu className="inline mr-1 w-4 h-4" /> CPU {getSortIcon('CPU')}
          </th>
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('GPU')}>
            GPU {getSortIcon('GPU')}
          </th>
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('RAM')}>
            RAM {getSortIcon('RAM')}
          </th>
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('VRAM')}>
            VRAM {getSortIcon('VRAM')}
          </th>
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('LLM')}>
            Modelo {getSortIcon('LLM')}
          </th>
          <th className="p-2 text-left cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('Model Size')}>
            Tamanho {getSortIcon('Model Size')}
          </th>
          <th className="p-2 text-right cursor-pointer whitespace-nowrap border-r border-gray-200" onClick={() => sortData('Performance')}>
            Token/s {getSortIcon('Performance')}
          </th>
          <th className="p-2 text-right cursor-pointer whitespace-nowrap" onClick={() => sortData('timeFor1kTokens')}>
            Tempo {getSortIcon('timeFor1kTokens')}
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: Item, index: number) => (
          <tr key={index} className="border-b hover:bg-gray-50">
            <td className="p-2 whitespace-nowrap border-r border-gray-200">{item.CPU}</td>
            <td className={`p-2 whitespace-nowrap border-r border-gray-200 ${!item.GPU.startsWith('RTX') ? 'text-red-500' : ''}`}>
              {item.GPU}
            </td>
            <td className="p-2 whitespace-nowrap border-r border-gray-200">{`${item.RAM} GB`}</td>
            <td className="p-2 whitespace-nowrap border-r border-gray-200">{item.VRAM}</td>
            <td className="p-2 whitespace-nowrap border-r border-gray-200">{item.LLM}</td>
            <td className="p-2 whitespace-nowrap border-r border-gray-200">{item["Model Size"]}</td>
            <td className="p-2 text-right whitespace-nowrap border-r border-gray-200">
              <span className={`px-2 py-1 rounded ${getPerformanceColor(item.Performance)}`}>
                {item.Performance >= 100 ? "⚡⚡" : item.Performance >= 50 ? "⚡" : ""}
                {item.Performance.toFixed(1)}
              </span>
            </td>
            <td className="p-2 text-right whitespace-nowrap">
              {Math.round(parseFloat(item.timeFor1kTokens))} s
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ChartToggleButton: React.FC<FilterButtonProps> = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-colors border rounded-lg
      ${isSelected 
        ? 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
  >
    {label}
  </button>
);

const PerformanceChart: React.FC<{ data: Item[] }> = ({ data }) => {
  const [chartMetric, setChartMetric] = useState('tokens'); // 'tokens' ou 'time'

  const chartData = data.map(item => ({
    name: item.CPU,
    value: chartMetric === 'tokens' ? item.Performance : parseFloat(item.timeFor1kTokens),
  }));

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Comparação de Performance</h3>
        <div className="flex gap-2">
          <ChartToggleButton
            label="Token/s"
            isSelected={chartMetric === 'tokens'}
            onClick={() => setChartMetric('tokens')}
          />
          <ChartToggleButton
            label="Tempo"
            isSelected={chartMetric === 'time'}
            onClick={() => setChartMetric('time')}
          />
        </div>
      </div>
      <div className="flex justify-center w-full overflow-x-auto">
        <div className="min-w-[800px] h-80">
          <BarChart
            width={800}
            height={300}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [
                `${value}${chartMetric === 'tokens' ? '' : ' s'}`,
                chartMetric === 'tokens' ? 'Token/s' : 'Tempo'
              ]}
            />
            <Bar 
              dataKey="value" 
              fill={chartMetric === 'tokens' ? '#8884d8' : '#82ca9d'}
              name={chartMetric === 'tokens' ? 'Token/s' : 'Tempo (s)'}
            />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

const initialData = [
  {"CPU":"Ryzen 5 5600X","Manufacturer":"AMD","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":105.2,"timeFor1kTokens":"9.51"},
  {"CPU":"Ryzen 5 5600X","Manufacturer":"AMD","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":58.1,"timeFor1kTokens":"17.21"},
  {"CPU":"Ryzen 5 5600X","Manufacturer":"AMD","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"deepseek-r1","Parameters":"8 B","Model Size":"5 GB","Performance":55,"timeFor1kTokens":"18.18"},
  {"CPU":"Ryzen 5 5600X","Manufacturer":"AMD","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"deepseek-r1","Parameters":"14 B","Model Size":"9 GB","Performance":31.1,"timeFor1kTokens":"32.15"},
  {"CPU":"Ryzen 5 5600X","Manufacturer":"AMD","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"phi4","Parameters":"14 B","Model Size":"9 GB","Performance":32,"timeFor1kTokens":"31.25"},
  {"CPU":"Ryzen 5 5800H","Manufacturer":"AMD","RAM":32,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":9.3,"timeFor1kTokens":"107.53"},
  {"CPU":"Ryzen 5 5800H","Manufacturer":"AMD","RAM":32,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"8 B","Model Size":"5 GB","Performance":8.4,"timeFor1kTokens":"119.05"},
  {"CPU":"Ryzen 5 5800H","Manufacturer":"AMD","RAM":32,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"14 B","Model Size":"9 GB","Performance":4.9,"timeFor1kTokens":"204.08"},
  {"CPU":"Ryzen 7 5800H","Manufacturer":"AMD","RAM":32,"GPU":"AMD Vega","VRAM":"3 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":18.9,"timeFor1kTokens":"52.91"},
  {"CPU":"Ryzen 7 5800H","Manufacturer":"AMD","RAM":32,"GPU":"AMD Vega","VRAM":"3 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":9,"timeFor1kTokens":"111.11"},
  {"CPU":"Ryzen 7 9800X3D","Manufacturer":"AMD","RAM":64,"GPU":"RTX 4070 Ti","VRAM":"16 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":158.1,"timeFor1kTokens":"6.33"},
  {"CPU":"Ryzen 7 9800X3D","Manufacturer":"AMD","RAM":64,"GPU":"RTX 4070 Ti","VRAM":"16 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":105.4,"timeFor1kTokens":"9.49"},
  {"CPU":"Ryzen 7 9800X3D","Manufacturer":"AMD","RAM":64,"GPU":"RTX 4070 Ti","VRAM":"16 GB","LLM":"deepseek-r1","Parameters":"14 B","Model Size":"9 GB","Performance":49.5,"timeFor1kTokens":"20.20"},
  {"CPU":"M3 Pro","Manufacturer":"Apple","RAM":18,"GPU":"n/a","VRAM":"0 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":49.4,"timeFor1kTokens":"20.24"},
  {"CPU":"M3 Pro","Manufacturer":"Apple","RAM":18,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":28.9,"timeFor1kTokens":"34.60"},
  {"CPU":"M3 Pro","Manufacturer":"Apple","RAM":18,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"14 B","Model Size":"9 GB","Performance":14.3,"timeFor1kTokens":"69.93"},
  {"CPU":"i9-14900HX","Manufacturer":"Intel","RAM":64,"GPU":"RTX 4060","VRAM":"8 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":30.4,"timeFor1kTokens":"32.89"},
  {"CPU":"i3-1215U","Manufacturer":"Intel","RAM":32,"GPU":"n/a","VRAM":"0 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":9.1,"timeFor1kTokens":"109.89"},
  {"CPU":"i3-1215U","Manufacturer":"Intel","RAM":32,"GPU":"n/a","VRAM":"0 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":3.7,"timeFor1kTokens":"270.27"},
  {"CPU":"i5-12450H","Manufacturer":"Intel","RAM":16,"GPU":"RTX 3050","VRAM":"6 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":58.8,"timeFor1kTokens":"17.01"},
  {"CPU":"i5-12450H","Manufacturer":"Intel","RAM":16,"GPU":"RTX 3050","VRAM":"6 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":20.9,"timeFor1kTokens":"47.85"},
  {"CPU":"i7-12700KF","Manufacturer":"Intel","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":57.7,"timeFor1kTokens":"17.33"},
  {"CPU":"i7-12700KF","Manufacturer":"Intel","RAM":32,"GPU":"RTX 3060","VRAM":"12 GB","LLM":"deepseek-r1","Parameters":"14 B","Model Size":"9 GB","Performance":30.5,"timeFor1kTokens":"32.79"},
  {"CPU":"i7-7500","Manufacturer":"Intel","RAM":8,"GPU":"910MX","VRAM":"2 GB","LLM":"llama3.2","Parameters":"3 B","Model Size":"2 GB","Performance":4.7,"timeFor1kTokens":"212.77"},
  {"CPU":"i7-7500","Manufacturer":"Intel","RAM":8,"GPU":"910MX","VRAM":"2 GB","LLM":"deepseek-r1","Parameters":"7 B","Model Size":"5 GB","Performance":2.5,"timeFor1kTokens":"400.00"}
];

const HardwareComparison = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Item; direction: 'asc' | 'desc' }>({ 
    key: 'Performance', 
    direction: 'desc' 
  });
  const [selectedModel, setSelectedModel] = useState('all');

  const modelOptions = [...new Set(initialData.map(item => `${item.LLM} | ${item.Parameters}`))];

  const sortData = (key: keyof Item) => {
    const direction: 'asc' | 'desc' = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    const filteredData = initialData.filter(item => {
      return selectedModel === 'all' || `${item.LLM} | ${item.Parameters}` === selectedModel;
    });

    return filteredData.sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
      }
      return a[sortConfig.key] > b[sortConfig.key] ? -1 : 1;
    });
  };

  const getSortIcon = (key: keyof Item) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'desc' ? <ChevronDown className="inline w-4 h-4" /> : <ChevronUp className="inline w-4 h-4" />;
    }
    return null;
  };

  const getPerformanceColor = (performance: number): string => {
    if (performance < 10) return 'bg-red-100 text-red-800';
    if (performance < 20) return 'bg-yellow-100 text-yellow-800';
    if (performance < 30) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const sortedData = getSortedData();

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Benchmark de Setups para LLMs rodando localmente</h1>
        <Filters
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          modelOptions={modelOptions}
        />
      </div>
      <div>
        <ComparisonTable
          data={sortedData}
          sortData={sortData}
          getSortIcon={getSortIcon}
          getPerformanceColor={getPerformanceColor}
        />
        {selectedModel !== 'all' && <PerformanceChart data={sortedData} />}
      </div>
    </div>
  );
};

export default HardwareComparison;