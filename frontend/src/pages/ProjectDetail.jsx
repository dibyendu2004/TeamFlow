import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { Circle, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do', priority: 'Medium', assignee: '', dueDate: '' });

  const fetchProjectData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: projData } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}`, config);
      setProject(projData);
      const { data: taskData } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/tasks`, config);
      setTasks(taskData);

      if (user.role === 'Admin') {
        const { data: usersData } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, config);
        setUsers(usersData);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/projects/${id}/tasks`, newTask, config);
      setShowTaskForm(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', assignee: '', dueDate: '' });
      fetchProjectData();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    const statuses = ['To Do', 'In Progress', 'Done'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}`, { status: nextStatus }, config);
      fetchProjectData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/tasks/${taskId}`, config);
        fetchProjectData();
      } catch (error) {
        alert('Could not delete task. ' + (error.response?.data?.message || ''));
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Project not found or access denied.</div>;

  const renderTaskColumn = (status, title, icon) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    // Dynamic column styling based on status
    let columnStyle = "bg-slate-50/80 border-slate-200/60";
    let badgeStyle = "bg-slate-200 text-slate-700";
    if (status === 'In Progress') {
      columnStyle = "bg-indigo-50/40 border-indigo-100/60";
      badgeStyle = "bg-indigo-100 text-indigo-700";
    } else if (status === 'Done') {
      columnStyle = "bg-emerald-50/40 border-emerald-100/60";
      badgeStyle = "bg-emerald-100 text-emerald-700";
    }

    return (
      <div className={`${columnStyle} p-5 rounded-3xl border shadow-sm backdrop-blur-sm flex flex-col h-full min-h-[500px] transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
          </div>
          <span className={`${badgeStyle} text-xs py-1 px-2.5 rounded-full font-bold shadow-sm`}>{columnTasks.length}</span>
        </div>
        <div className="flex flex-col space-y-4 flex-grow">
          {columnTasks.map(task => (
            <div key={task._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-brand-300 transition-all duration-300 transform hover:-translate-y-1 group relative cursor-pointer">
              <div className="mb-3 pr-6">
                <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-brand-600 transition-colors">{task.title}</h4>
                <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {task.dueDate && (
                    <div className={`text-xs font-semibold flex items-center px-2.5 py-1 rounded-md ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {task.assignee && (
                      <div className="text-xs text-brand-700 font-semibold bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-md flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-1.5"></div>
                        {task.assignee.name}
                      </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${
                  task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                  task.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>{task.priority}</span>
                <div className="flex space-x-2">
                  <button onClick={() => updateTaskStatus(task._id, task.status)} className="text-xs text-brand-600 hover:text-white font-semibold bg-brand-50 hover:bg-brand-600 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow">
                    Move &rarr;
                  </button>
                  {user.role === 'Admin' && (
                     <button onClick={() => handleDeleteTask(task._id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors absolute top-3 right-3 opacity-0 group-hover:opacity-100">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-grow p-6 text-slate-400 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/30">
              <Circle className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-sm font-medium">No tasks</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500 mt-2 max-w-4xl">{project.description}</p>
        </div>
        {user.role === 'Admin' && (
          <button onClick={() => setShowTaskForm(!showTaskForm)} className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </button>
        )}
      </div>

      {user.role === 'Admin' && showTaskForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
              <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="2"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <select value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Unassigned</option>
                {user.role === 'Admin' && users.length > 0 ? (
                  <>
                    <optgroup label="Project Members">
                      {project.members && project.members.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Users">
                      {users.filter(u => !project.members?.find(m => m._id === u._id)).map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <>
                    {project.members && project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                    {project.createdBy && (!project.members || !project.members.find(m => m._id === project.createdBy._id)) && (
                      <option key={project.createdBy._id} value={project.createdBy._id}>{project.createdBy.name} (Admin)</option>
                    )}
                  </>
                )}
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors">Add Task</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderTaskColumn('To Do', 'To Do', <Circle className="w-5 h-5 text-slate-400" />)}
        {renderTaskColumn('In Progress', 'In Progress', <Clock className="w-5 h-5 text-brand-500" />)}
        {renderTaskColumn('Done', 'Done', <CheckCircle2 className="w-5 h-5 text-green-500" />)}
      </div>
    </div>
  );
};

export default ProjectDetail;
