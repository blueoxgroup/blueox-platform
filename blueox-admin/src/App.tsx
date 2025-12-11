import React, { useState, useEffect } from 'react';
import { Users, FileText, CreditCard, Briefcase, CheckCircle, Clock, Download, Plus, X, Search, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase, Client, Application, Document as DocType, Payment, Job, ClientPaymentPhases } from './lib/supabase';

type Tab = 'clients' | 'applications' | 'documents' | 'payments' | 'jobs';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Blue OX" className="h-16 mx-auto mb-4" />
          <h1 className="font-orbitron text-2xl font-bold text-navy">Admin Console</h1>
          <p className="text-gray-500 mt-2">Secure access for administrators only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition"
              placeholder="admin@blueox.eu"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent transition pr-12"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-white py-3 rounded-lg font-semibold hover:bg-coral-dark transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Sign In to Admin
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          This is a secure admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { client: currentClient, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [applications, setApplications] = useState<(Application & { client?: Client })[]>([]);
  const [documents, setDocuments] = useState<(DocType & { client?: Client })[]>([]);
  const [payments, setPayments] = useState<(Payment & { client?: Client })[]>([]);
  const [paymentPhases, setPaymentPhases] = useState<(ClientPaymentPhases & { client?: Client })[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) fetchAllData();
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      const [clientsRes, appsRes, docsRes, paymentsRes, paymentPhasesRes, jobsRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('client_payment_phases').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      ]);

      // Handle each response individually with error logging
      const clientsData = clientsRes.data || [];
      if (clientsRes.error) {
        console.log('Clients fetch error:', clientsRes.error.message);
      }
      setClients(clientsData);

      const clientMap = Object.fromEntries(clientsData.map(c => [c.id, c]));
      
      if (appsRes.error) console.log('Applications fetch error:', appsRes.error.message);
      if (docsRes.error) console.log('Documents fetch error:', docsRes.error.message);
      if (paymentsRes.error) console.log('Payments fetch error:', paymentsRes.error.message);
      if (paymentPhasesRes.error) console.log('Payment phases fetch error:', paymentPhasesRes.error.message);
      if (jobsRes.error) console.log('Jobs fetch error:', jobsRes.error.message);
      
      setApplications((appsRes.data || []).map(a => ({ ...a, client: clientMap[a.client_id] })));
      setDocuments((docsRes.data || []).map(d => ({ ...d, client: clientMap[d.client_id] })));
      setPayments((paymentsRes.data || []).map(p => ({ ...p, client: clientMap[p.client_id] })));
      setPaymentPhases((paymentPhasesRes.data || []).map(pp => ({ ...pp, client: clientMap[pp.client_id] })));
      setJobs(jobsRes.data || []);
      
      console.log('Data fetch completed:', {
        clients: clientsData.length,
        applications: (appsRes.data || []).length,
        documents: (docsRes.data || []).length,
        payments: (paymentsRes.data || []).length,
        paymentPhases: (paymentPhasesRes.data || []).length,
        jobs: (jobsRes.data || []).length
      });
      
    } catch (error) {
      console.error('Data fetch exception:', error);
      // Even on error, set empty arrays to prevent crashes
      setClients([]);
      setApplications([]);
      setDocuments([]);
      setPayments([]);
      setPaymentPhases([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    fetchAllData();
  };

  const verifyDocument = async (id: string) => {
    await supabase.from('documents').update({ 
      is_verified: true, 
      verified_by: currentClient?.id,
      verified_at: new Date().toISOString()
    }).eq('id', id);
    fetchAllData();
  };

  const updatePayment = async (id: string, status: string) => {
    await supabase.from('payments').update({ 
      status, 
      verified_by: status === 'verified' ? currentClient?.id : null,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    fetchAllData();
  };

  const addPayment = async (clientId: string, phase: number, amount: number) => {
    await supabase.from('payments').insert({
      client_id: clientId,
      phase,
      amount,
      currency: 'EUR',
      status: 'pending'
    });
    setShowModal(null);
    fetchAllData();
  };

  const saveJob = async (job: Partial<Job>) => {
    if (job.id) {
      await supabase.from('jobs').update({
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        job_type: job.job_type,
        description: job.description,
        requirements: job.requirements,
        salary_range: job.salary_range,
        is_active: job.is_active,
        updated_at: new Date().toISOString()
      }).eq('id', job.id);
    } else {
      await supabase.from('jobs').insert({
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        job_type: job.job_type,
        description: job.description,
        requirements: job.requirements,
        salary_range: job.salary_range,
        is_active: true
      });
    }
    setShowModal(null);
    setEditingItem(null);
    fetchAllData();
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    await supabase.from('jobs').delete().eq('id', id);
    fetchAllData();
  };

  const downloadDocument = async (doc: DocType) => {
    const { data } = await supabase.storage.from('client-documents').download(doc.file_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-coral mx-auto mb-4" />
          <h2 className="font-orbitron text-xl font-bold text-navy mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have administrator privileges.</p>
          <button onClick={signOut} className="bg-coral text-white px-6 py-2 rounded-lg hover:bg-coral-dark transition">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      documents_requested: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      verified: 'bg-emerald-100 text-emerald-800',
      admin: 'bg-coral text-white',
      student: 'bg-blue-100 text-blue-800',
      workforce: 'bg-indigo-100 text-indigo-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ')}
    </span>;
  };

  const togglePaymentPhase = async (phaseId: string, field: string, currentValue: boolean, amount?: number) => {
    // Determine the date field based on the phase
    let dateField = '';
    if (field === 'phase_1_down_payment') dateField = 'phase_1_date';
    else if (field === 'phase_2_embassy_fee') dateField = 'phase_2_date';
    else if (field === 'phase_3_after_visa_fee') dateField = 'phase_3_date';
    
    const updateData: any = {
      [field]: !currentValue,
      [dateField]: !currentValue ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString()
    };
    
    // Update amount if provided
    if (amount !== undefined) {
      const amountField = field.replace('_down_payment', '_amount')
                              .replace('_embassy_fee', '_amount')
                              .replace('_after_visa_fee', '_amount');
      updateData[amountField] = amount;
    }
    
    await supabase.from('client_payment_phases').update(updateData).eq('id', phaseId);
    fetchAllData();
  };

  // Define tabs outside the component to prevent recreation on every render
  const baseTabs = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Payment Phases', icon: CreditCard },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
  ] as const;

  // Create tabs with current counts
  const tabs = baseTabs.map(tab => ({
    ...tab,
    count: tab.id === 'clients' ? clients.length :
           tab.id === 'applications' ? applications.length :
           tab.id === 'documents' ? documents.length :
           tab.id === 'payments' ? paymentPhases.length :
           tab.id === 'jobs' ? jobs.length : 0
  }));



  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-inter min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy text-white sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Blue OX" className="h-10 mr-4" />
            <div>
              <h1 className="font-orbitron text-xl font-bold">Admin Console</h1>
              <p className="text-gray-400 text-sm">CRM Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">{currentClient?.full_name}</span>
            <button 
              onClick={async () => {
                try {
                  console.log('Testing database connection...');
                  const { data, error } = await supabase.from('clients').select('id, email, role').limit(1);
                  
                  if (error) {
                    console.error('Database test failed:', error);
                    alert(`Database Test Failed: ${error.message}`);
                  } else {
                    console.log('Database test successful:', data);
                    alert('Database Test Successful! Refreshing data...');
                    fetchAllData();
                  }
                } catch (err) {
                  console.error('Database test exception:', err);
                  alert(`Database Test Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
              }}
              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
            >
              Test DB
            </button>
            <button onClick={signOut} className="flex items-center text-gray-300 hover:text-white transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[68px] z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center py-4 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === 'clients' ? 'border-coral text-coral' : 'border-transparent text-gray-600 hover:text-coral'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Clients
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{clients.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center py-4 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === 'applications' ? 'border-coral text-coral' : 'border-transparent text-gray-600 hover:text-coral'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Applications
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{applications.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center py-4 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === 'documents' ? 'border-coral text-coral' : 'border-transparent text-gray-600 hover:text-coral'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Documents
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{documents.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center py-4 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === 'payments' ? 'border-coral text-coral' : 'border-transparent text-gray-600 hover:text-coral'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Phases
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{paymentPhases.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center py-4 border-b-2 font-medium whitespace-nowrap transition ${
                activeTab === 'jobs' ? 'border-coral text-coral' : 'border-transparent text-gray-600 hover:text-coral'
              }`}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Jobs
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{jobs.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === 'clients' && (
              <div>
                <div className="mb-4 flex items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredClients.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-navy">{c.full_name}</td>
                          <td className="px-4 py-3 text-gray-600">{c.email}</td>
                          <td className="px-4 py-3">{getStatusBadge(c.role)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredClients.length === 0 && <p className="text-center py-8 text-gray-500">No clients found.</p>}
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-navy">{app.client?.full_name || 'Unknown'}</td>
                        <td className="px-4 py-3 capitalize">{app.application_type}</td>
                        <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                        <td className="px-4 py-3 text-gray-600">{app.target_country || '-'}</td>
                        <td className="px-4 py-3">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="documents_requested">Docs Requested</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applications.length === 0 && <p className="text-center py-8 text-gray-500">No applications yet.</p>}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-navy">{doc.client?.full_name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{doc.file_name}</td>
                        <td className="px-4 py-3">{doc.document_type}</td>
                        <td className="px-4 py-3">
                          {doc.is_verified ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600 text-sm">
                              <Clock className="w-4 h-4 mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button onClick={() => downloadDocument(doc)} className="text-blue-600 hover:text-blue-800">
                              <Download className="w-4 h-4" />
                            </button>
                            {!doc.is_verified && (
                              <button onClick={() => verifyDocument(doc.id)} className="text-green-600 hover:text-green-800">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {documents.length === 0 && <p className="text-center py-8 text-gray-500">No documents uploaded yet.</p>}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-orbitron font-bold text-navy mb-2">Payment Phase Tracking</h2>
                  <p className="text-gray-600 text-sm">Track the 3-phase payment journey for each client</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phase 1: Down Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phase 2: Embassy Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phase 3: After Visa Fee</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paymentPhases.map((phase) => (
                        <tr key={phase.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-navy">{phase.client?.full_name || 'Unknown'}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <button
                                onClick={() => togglePaymentPhase(phase.id, 'phase_1_down_payment', phase.phase_1_down_payment)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition ${
                                  phase.phase_1_down_payment 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {phase.phase_1_down_payment ? '✓ Paid' : '✗ Not Paid'}
                              </button>
                              {phase.phase_1_amount > 0 && (
                                <p className="text-xs text-gray-600">€{phase.phase_1_amount}</p>
                              )}
                              {phase.phase_1_date && (
                                <p className="text-xs text-gray-500">{new Date(phase.phase_1_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <button
                                onClick={() => togglePaymentPhase(phase.id, 'phase_2_embassy_fee', phase.phase_2_embassy_fee)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition ${
                                  phase.phase_2_embassy_fee 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {phase.phase_2_embassy_fee ? '✓ Paid' : '✗ Not Paid'}
                              </button>
                              {phase.phase_2_amount > 0 && (
                                <p className="text-xs text-gray-600">€{phase.phase_2_amount}</p>
                              )}
                              {phase.phase_2_date && (
                                <p className="text-xs text-gray-500">{new Date(phase.phase_2_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <button
                                onClick={() => togglePaymentPhase(phase.id, 'phase_3_after_visa_fee', phase.phase_3_after_visa_fee)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition ${
                                  phase.phase_3_after_visa_fee 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {phase.phase_3_after_visa_fee ? '✓ Paid' : '✗ Not Paid'}
                              </button>
                              {phase.phase_3_amount > 0 && (
                                <p className="text-xs text-gray-600">€{phase.phase_3_amount}</p>
                              )}
                              {phase.phase_3_date && (
                                <p className="text-xs text-gray-500">{new Date(phase.phase_3_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                            {phase.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {paymentPhases.length === 0 && <p className="text-center py-8 text-gray-500">No payment phase records yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => { setEditingItem({}); setShowModal('job'); }}
                    className="bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-coral-dark transition flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Job
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-navy">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.company} - {job.location}, {job.country}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setEditingItem(job); setShowModal('job'); }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button onClick={() => deleteJob(job.id)} className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {jobs.length === 0 && <p className="text-center py-8 text-gray-500">No jobs posted yet.</p>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showModal === 'payment' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-xl font-bold text-navy">Add Payment</h3>
              <button onClick={() => setShowModal(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              addPayment(form.client.value, parseInt(form.phase.value), parseFloat(form.amount.value));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <select name="client" className="w-full border rounded-lg px-3 py-2" required>
                    {clients.filter(c => c.role !== 'admin').map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phase</label>
                  <select name="phase" className="w-full border rounded-lg px-3 py-2">
                    <option value="1">Phase 1</option>
                    <option value="2">Phase 2</option>
                    <option value="3">Phase 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (EUR)</label>
                  <input type="number" name="amount" step="0.01" className="w-full border rounded-lg px-3 py-2" required />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-coral text-white py-2 rounded-lg font-medium hover:bg-coral-dark">
                Add Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showModal === 'job' && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-orbitron text-xl font-bold text-navy">{editingItem.id ? 'Edit Job' : 'Add Job'}</h3>
              <button onClick={() => { setShowModal(null); setEditingItem(null); }}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveJob(editingItem);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input type="text" value={editingItem.title || ''} onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input type="text" value={editingItem.company || ''} onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" value={editingItem.location || ''} onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input type="text" value={editingItem.country || ''} onChange={(e) => setEditingItem({ ...editingItem, country: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Type</label>
                  <select value={editingItem.job_type || 'Full-time'} onChange={(e) => setEditingItem({ ...editingItem, job_type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Seasonal</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary Range</label>
                  <input type="text" value={editingItem.salary_range || ''} onChange={(e) => setEditingItem({ ...editingItem, salary_range: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 2,000 - 2,500 EUR/month" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-24" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Requirements</label>
                  <textarea value={editingItem.requirements || ''} onChange={(e) => setEditingItem({ ...editingItem, requirements: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-20" />
                </div>
                {editingItem.id && (
                  <div className="flex items-center">
                    <input type="checkbox" id="is_active" checked={editingItem.is_active} onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })} className="mr-2" />
                    <label htmlFor="is_active" className="text-sm">Active</label>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full mt-4 bg-coral text-white py-2 rounded-lg font-medium hover:bg-coral-dark">
                {editingItem.id ? 'Update Job' : 'Create Job'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-coral border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AdminDashboard />;
};

const AppWrapper: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;
