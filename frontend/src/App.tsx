import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useComponents, useCreateComponent, useUpdateComponent, useDeleteComponent } from './hooks/useComponents';
import { useRecords, useCreateRecord, useUpdateRecord, useDeleteRecord } from './hooks/useRecords';
import { ComponentCard } from './components/ComponentCard';
import { ComponentForm } from './components/ComponentForm';
import { RecordModal } from './components/RecordModal';
import { CalendarView } from './components/Dashboard/CalendarView';
import { WeeklyGoalsView } from './components/Dashboard/WeeklyGoalsView';
import { MetricsPanel } from './components/Dashboard/MetricsPanel';
import { Button } from './components/ui/Button';
import type { Component, ComponentFormData, Record, RecordFormData } from './types';

const queryClient = new QueryClient();

function Dashboard() {
  const [isComponentFormOpen, setIsComponentFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [loggingComponent, setLoggingComponent] = useState<Component | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [addingRecordDate, setAddingRecordDate] = useState<string | null>(null);

  const { data: components = [], isLoading: componentsLoading } = useComponents();
  const { data: records = [], isLoading: recordsLoading } = useRecords();

  const createComponent = useCreateComponent();
  const updateComponent = useUpdateComponent();
  const deleteComponent = useDeleteComponent();
  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const deleteRecord = useDeleteRecord();

  const handleCreateComponent = (data: ComponentFormData) => {
    createComponent.mutate(data, {
      onSuccess: () => setIsComponentFormOpen(false),
    });
  };

  const handleUpdateComponent = (data: ComponentFormData) => {
    if (editingComponent) {
      updateComponent.mutate(
        { id: editingComponent._id, data },
        { onSuccess: () => setEditingComponent(null) }
      );
    }
  };

  const handleDeleteComponent = (id: string) => {
    if (confirm('Delete this component and all its records?')) {
      deleteComponent.mutate(id);
    }
  };

  const handleLogActivity = (data: RecordFormData) => {
    createRecord.mutate(data, {
      onSuccess: () => {
        setLoggingComponent(null);
        setAddingRecordDate(null);
      },
    });
  };

  const handleDayClick = (date: string) => {
    if (components.length > 0) {
      setAddingRecordDate(date);
    }
  };

  const handleUpdateRecord = (data: Partial<Omit<RecordFormData, 'componentId'>>) => {
    if (editingRecord) {
      updateRecord.mutate(
        { id: editingRecord._id, data },
        { onSuccess: () => setEditingRecord(null) }
      );
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Delete this record?')) {
      deleteRecord.mutate(id, {
        onSuccess: () => setEditingRecord(null),
      });
    }
  };

  if (componentsLoading || recordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pulse</h1>
            <Button onClick={() => setIsComponentFormOpen(true)}>
              Add Component
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Components</h2>
              {components.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500 mb-4">No components yet. Create one to start tracking!</p>
                  <Button onClick={() => setIsComponentFormOpen(true)}>
                    Create Your First Component
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {components.map((component) => (
                    <ComponentCard
                      key={component._id}
                      component={component}
                      onEdit={setEditingComponent}
                      onDelete={handleDeleteComponent}
                      onLogActivity={setLoggingComponent}
                    />
                  ))}
                </div>
              )}
            </section>

            <CalendarView records={records} components={components} onRecordClick={setEditingRecord} onDayClick={handleDayClick} />

            <MetricsPanel records={records} components={components} />
          </div>

          <div>
            <WeeklyGoalsView
              components={components}
              onLogActivity={setLoggingComponent}
            />
          </div>
        </div>
      </main>

      <ComponentForm
        isOpen={isComponentFormOpen}
        onClose={() => setIsComponentFormOpen(false)}
        onSubmit={handleCreateComponent}
        isLoading={createComponent.isPending}
      />

      <ComponentForm
        isOpen={!!editingComponent}
        onClose={() => setEditingComponent(null)}
        onSubmit={handleUpdateComponent}
        component={editingComponent}
        isLoading={updateComponent.isPending}
      />

      <RecordModal
        isOpen={!!loggingComponent}
        onClose={() => setLoggingComponent(null)}
        onSubmit={handleLogActivity}
        component={loggingComponent}
        isLoading={createRecord.isPending}
      />

      <RecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSubmit={handleLogActivity}
        onUpdate={handleUpdateRecord}
        onDelete={handleDeleteRecord}
        component={null}
        record={editingRecord}
        isLoading={updateRecord.isPending}
      />

      <RecordModal
        isOpen={!!addingRecordDate}
        onClose={() => setAddingRecordDate(null)}
        onSubmit={handleLogActivity}
        component={null}
        components={components}
        defaultDate={addingRecordDate || undefined}
        isLoading={createRecord.isPending}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
