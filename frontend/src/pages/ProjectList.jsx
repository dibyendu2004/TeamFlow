import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Users } from 'lucide-react';

const ProjectList = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [initialTasks, setInitialTasks] = useState([]);

  const addTask = () => {
    setInitialTasks([...initialTasks, { id: Date.now(), title: '', description: '', assignee: '', priority: 'Medium', dueDate: '' }]);
  };

  const removeTask = (id) => {
    setInitialTasks(initialTasks.filter(t => t.id !== id));
  };

  const updateTask = (id, field, value) => {
    setInitialTasks(initialTasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/projects', config);
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user.role === 'Admin') {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/auth/users', config);
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/projects', { name, description, members, tasks: initialTasks }, config);
      setShowCreate(false);
      setName('');
      setDescription('');
      setMembers([]);
      setInitialTasks([]);
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Error creating project. Only Admin can create projects.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading projects...</div>;

  return (
    <div className="fade-in space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and collaborate on your team projects.</p>
        </div>
        {user.role === 'Admin' && (
          <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
            <PlusCircle className="w-4 h-4 mr-2" /> New Project
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Project</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" placeholder="E.g., Team Alpha Revamp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" placeholder="What is this project about?"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Team Members</label>
              <select multiple value={members} onChange={(e) => setMembers(Array.from(e.target.selectedOptions, option => option.value))} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500">
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple members</p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-slate-800">Initial Tasks (Optional)</h4>
                <button type="button" onClick={addTask} className="text-xs font-medium px-2 py-1 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded transition-colors">
                  + Add Task
                </button>
              </div>
              {initialTasks.map((task) => (
                <div key={task.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 space-y-3 relative group">
                  <button type="button" onClick={() => removeTask(task.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hidden group-hover:block px-2">
                    &times;
                  </button>
                  <input type="text" value={task.title} onChange={(e) => updateTask(task.id, 'title', e.target.value)} required placeholder="Task Title" className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={task.assignee} onChange={(e) => updateTask(task.id, 'assignee', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none bg-white">
                      <option value="">Unassigned</option>
                      {users.filter(u => members.includes(u._id) || u._id === user._id).map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                    <input type="date" value={task.dueDate} onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)} className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link key={project._id} to={`/projects/${project._id}`} className="block group">
            <div className={`rounded-2xl p-6 shadow-sm border transition-all h-full flex flex-col ${project.status === 'Completed' ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:shadow-md hover:border-brand-200'}`}>
              <div className="mb-4 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className={`text-lg font-semibold transition-colors line-clamp-1 ${project.status === 'Completed' ? 'text-slate-600' : 'text-brand-700 group-hover:text-brand-600'}`}>{project.name}</h3>
                  {project.status === 'Completed' && (
                    <span className="bg-slate-200 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 whitespace-nowrap">Completed</span>
                  )}
                </div>
                <p className={`text-sm mt-2 line-clamp-2 ${project.status === 'Completed' ? 'text-slate-400' : 'text-slate-500'}`}>{project.description}</p>
              </div>
              <div className="flex items-center mt-4 text-xs font-medium text-slate-500 bg-slate-100/50 px-3 py-2 rounded-lg w-fit">
                <Users className="w-4 h-4 mr-1.5" />
                {project.members.length} Members
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
