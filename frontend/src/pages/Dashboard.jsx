import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { CheckCircle2, Clock, AlertCircle, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [projRes, taskRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects`, config),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks/user/me`, config)
        ]);
        setProjects(projRes.data);
        setTasks(taskRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const activeProjects = projects.filter(p => p.status !== 'Completed');
  const completedProjects = projects.filter(p => p.status === 'Completed');

  const completeProject = async (projectId) => {
    if (window.confirm("Are you sure you want to mark this project as completed?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}`, { status: 'Completed' }, config);
        setProjects(projects.map(p => p._id === projectId ? { ...p, status: 'Completed' } : p));
      } catch (error) {
        alert('Error updating project status. ' + (error.response?.data?.message || ''));
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading summary...</div>;

  return (
    <div className="fade-in space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-500 mt-1">Here is what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
            <LayoutDashboard className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Projects</p>
            <p className="text-2xl font-bold text-slate-800">{activeProjects.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed Projects</p>
            <p className="text-2xl font-bold text-slate-800">{completedProjects.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{user.role === 'Admin' ? 'All Tasks' : 'My Tasks'}</p>
            <p className="text-2xl font-bold text-slate-800">{activeTasks.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Clock className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-slate-800">{inProgressTasks.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertCircle className="w-8 h-8"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Overdue</p>
            <p className="text-2xl font-bold text-slate-800">{overdueTasks.length}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800">Your Active Projects</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {activeProjects.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-500">No active projects found.</li>
            ) : (
              activeProjects.map(project => (
                <li key={project._id} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-md font-medium text-brand-600">{project.name}</span>
                      <span className="text-sm text-slate-500 mt-1">{project.description}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-400">
                        {project.members.length} members
                      </span>
                      <button onClick={() => completeProject(project._id)} className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        Mark Complete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800">{user.role === 'Admin' ? 'All Team Tasks' : 'My Tasks'}</h3>
          </div>
          <ul className="divide-y divide-slate-100 h-96 overflow-y-auto">
            {activeTasks.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-500">{user.role === 'Admin' ? 'No active tasks exist in the system.' : 'No active tasks assigned to you.'}</li>
            ) : (
              activeTasks.map(task => (
                <li key={task._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-md font-medium text-slate-800">{task.title}</span>
                      <div className="text-xs text-slate-500 mt-1 flex gap-2">
                        <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{task.project?.name}</span>
                        {user.role === 'Admin' && task.assignee && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{task.assignee.name}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          task.status === 'Done' ? 'bg-green-50 text-green-600' :
                          task.status === 'In Progress' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>{task.status}</span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className={`text-xs font-medium flex items-center ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500' : 'text-slate-400'}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
