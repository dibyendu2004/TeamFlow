import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.members.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to add task to this project' });
    }

    if (assignee && !project.members.includes(assignee)) {
      project.members.push(assignee);
      await project.save();
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project: projectId,
      assignee
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const query = { project: projectId };
    if (req.user.role !== 'Admin') {
      query.assignee = req.user._id;
    }
    
    const tasks = await Task.find(query).populate('assignee', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Assuming simple authorization: anyone in project could theoretically update if member, Admin can update anything.
    // For stricter rules, we'd check if user is assignee or admin. Let's allow update.
    
    if (req.body.assignee && req.body.assignee !== task.assignee?.toString()) {
      const project = await Project.findById(task.project);
      if (project && !project.members.includes(req.body.assignee)) {
        project.members.push(req.body.assignee);
        await project.save();
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true }).populate('assignee', 'name email');
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized to delete task' });
    }
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find({}).populate('project', 'name').populate('assignee', 'name email');
    } else {
      tasks = await Task.find({ assignee: req.user._id }).populate('project', 'name').populate('assignee', 'name email');
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
