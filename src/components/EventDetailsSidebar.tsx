import { Users, FileText, Bell, Settings } from 'lucide-react';

interface EventDetailsSidebarProps {
  activeSection: 'speakers' | 'assets' | 'reminders' | 'settings';
  onSectionChange: (section: 'speakers' | 'assets' | 'reminders' | 'settings') => void;
  speakerCount?: number;
  className?: string;
}

export function EventDetailsSidebar({
  activeSection,
  onSectionChange,
  speakerCount,
  className = '',
}: EventDetailsSidebarProps) {
  const sections = [
    {
      id: 'speakers' as const,
      label: 'Speakers',
      icon: Users,
      count: speakerCount,
    },
    {
      id: 'assets' as const,
      label: 'Assets',
      icon: FileText,
    },
    {
      id: 'reminders' as const,
      label: 'Reminders',
      icon: Bell,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className={`bg-white border-r border-gray-200 ${className}`}>
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Event Management
        </h2>
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {section.count !== undefined && section.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {section.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
