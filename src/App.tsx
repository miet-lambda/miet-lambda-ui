import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './components/AuthModal';
import NewProjectModal from './components/NewProjectModal';
import ApiKeyModal from './components/ApiKeyModal';
import ScriptSettings, { ScriptConfig } from './components/ScriptSettings';
import ExecutionLogs, { ExecutionLog, ScriptChange } from './components/ExecutionLogs';
import CodeEditor from './components/Editor';
import Alert from './components/Alert';
import NewScriptModal from './components/NewScriptModal';
import ScriptUrlConfig from './components/ScriptUrlConfig';
import ScriptTestDialog from './components/ScriptTestDialog';
import Documentation from './components/Documentation';
import LoadScriptModal from './components/LoadScriptModal';
import RenameScriptModal from './components/RenameScriptModal';
import { ScriptLanguage, LANGUAGE_CONFIGS } from './types/script';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { auth, projects as projectsApi, scripts as scriptsApi } from './services/api';

interface User {
  name: string;
  email: string;
}

interface Script {
  id: string;
  name: string;
  content: string;
  config: ScriptConfig;
  urlPath: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  scripts: Script[];
}

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

type AlertOptions = Omit<AlertState, 'isOpen'>;

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isScriptSettingsOpen, setIsScriptSettingsOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [isNewScriptModalOpen, setIsNewScriptModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const isResizing = useRef(false);
  const lastX = useRef(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isUrlConfigOpen, setIsUrlConfigOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [scriptToTest, setScriptToTest] = useState<Script | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [scriptHistory, setScriptHistory] = useState<ScriptChange[]>([]);
  const [isLoadScriptModalOpen, setIsLoadScriptModalOpen] = useState(false);
  const [scriptToRename, setScriptToRename] = useState<Script | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useTheme();
  const [draggedScript, setDraggedScript] = useState<Script | null>(null);

  const apiKey = "sk_test_1234567890abcdefghijklmnopqrstuvwxyz";

  const simulateLogin = useCallback(async (name?: string, email?: string) => {
    try {
      const response = await auth.getCurrentUser();
      const userData = response.data;
      setCurrentUser({
        name: userData.login,
        email: userData.login
      });
      loadProjects();
    } catch (error) {
      console.error('Failed to get current user:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to get user data',
        type: 'error'
      });
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      simulateLogin();
    }
  }, [simulateLogin]);

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getAll();
      const projectsData = response.data;
      setProjects(projectsData.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        description: '',
        createdAt: new Date(),
        scripts: []
      })));
    } catch (error) {
      console.error('Failed to load projects:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to load projects',
        type: 'error'
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      await simulateLogin();
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      showAlert({
        title: 'Error',
        message: 'Invalid credentials',
        type: 'error'
      });
    }
  };

  const handleRegister = async (name: string, email: string, password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      showAlert({
        title: 'Validation Error',
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    try {
      await auth.register(email, password);
      await handleLogin(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      showAlert({
        title: 'Error',
        message: 'Registration failed',
        type: 'error'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    setProjects([]);
    setCurrentProject(null);
    setCurrentScript(null);
  };

  const showAlert = (options: Omit<AlertState, 'isOpen'>) => {
    setAlert({
      ...options,
      isOpen: true
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const response = await projectsApi.create(name);
      const newProject = {
        id: response.data.id.toString(),
        name: response.data.name,
        description,
        createdAt: new Date(),
        scripts: []
      };
      
      setProjects([...projects, newProject]);
      setIsNewProjectModalOpen(false);
      openProject(newProject);

      showAlert({
        title: 'Success',
        message: 'Project created successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to create project',
        type: 'error'
      });
    }
  };

  const openProject = async (project: Project) => {
    try {
      const response = await scriptsApi.getAll(parseInt(project.id));
      const scriptsData = response.data;
      
      const updatedProject = {
        ...project,
        scripts: scriptsData.map((s: any) => ({
          id: s.id.toString(),
          name: s.path.split('/').pop() || 'untitled.lua',
          content: s.source_code,
          config: {
            memoryLimit: 128,
            timeout: 30000
          },
          urlPath: s.path
        }))
      };
      
      setCurrentProject(updatedProject);
      setCurrentScript(updatedProject.scripts[0] || null);
    } catch (error) {
      console.error('Failed to load project scripts:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to load project scripts',
        type: 'error'
      });
    }
  };

  const handleSaveScript = async () => {
    if (!currentProject || !currentScript) return;
    
    try {
      await scriptsApi.update(
        parseInt(currentProject.id),
        parseInt(currentScript.id),
        currentScript.urlPath,
        currentScript.content
      );

      showAlert({
        title: 'Success',
        message: `Script ${currentScript.name} saved successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save script:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save script',
        type: 'error'
      });
    }
  };

  const handleScriptSettingsSave = (newConfig: ScriptConfig) => {
    if (!currentScript || !currentProject) {
      showAlert({
        title: 'Error',
        message: 'No script or project selected',
        type: 'error'
      });
      return;
    }

    const updatedScript = { ...currentScript, config: newConfig };
    const updatedScripts = currentProject.scripts.map(script =>
      script.id === currentScript.id ? updatedScript : script
    );
    const updatedProject = { ...currentProject, scripts: updatedScripts };

    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === currentProject.id ? updatedProject : project
      )
    );
    setCurrentProject(updatedProject);
    setCurrentScript(updatedScript);
    setIsScriptSettingsOpen(false);

    showAlert({
      title: 'Success',
      message: 'Script settings updated successfully',
      type: 'success'
    });
  };

  const handleExecuteScript = async () => {
    if (!currentProject || !currentScript) return;
    
    try {
      const response = await scriptsApi.execute(
        parseInt(currentProject.id),
        parseInt(currentScript.id)
      );

      const executionResult = response.data;
      
      // Add execution log
      const newLog: ExecutionLog = {
        id: Date.now().toString(),
        projectId: currentProject.id,
        projectName: currentProject.name,
        scriptName: currentScript.name,
        timestamp: new Date(),
        status: executionResult.status,
        response: executionResult.response,
        executionCost: executionResult.cost,
        memoryUsed: executionResult.memory_used,
        executionTime: executionResult.execution_time
      };

      setExecutionLogs(prevLogs => [newLog, ...prevLogs]);

      showAlert({
        title: 'Success',
        message: `Script ${currentScript.name} executed successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to execute script:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to execute script',
        type: 'error'
      });
    }
  };

  const handleClearLogs = (projectId?: string) => {
    showAlert({
      title: 'Confirm Clear Logs',
      message: `Are you sure you want to clear ${projectId ? 'project' : 'all'} execution logs?`,
      type: 'warning',
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        setExecutionLogs(prevLogs => 
          projectId ? prevLogs.filter(log => log.projectId !== projectId) : []
        );
        showAlert({
          title: 'Success',
          message: 'Logs cleared successfully',
          type: 'success'
        });
      }
    });
  };

  const handleDeleteScript = async (scriptName: string) => {
    if (!currentProject || !currentScript) return;
    
    // Show confirmation dialog
    showAlert({
      title: 'Confirm Delete',
      message: currentProject.scripts.length === 1 
        ? 'This is the last script in the project. Deleting it will leave the project empty. Are you sure?'
        : 'Are you sure you want to delete this script?',
      type: 'warning',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await scriptsApi.delete(
            parseInt(currentProject.id),
            parseInt(currentScript.id)
          );

          const updatedScripts = currentProject.scripts.filter(s => s.name !== scriptName);
          setCurrentProject({
            ...currentProject,
            scripts: updatedScripts
          });
          
          if (currentScript?.name === scriptName) {
            setCurrentScript(updatedScripts[0] || null);
          }

          showAlert({
            title: 'Success',
            message: 'Script deleted successfully',
            type: 'success'
          });
        } catch (error) {
          console.error('Failed to delete script:', error);
          showAlert({
            title: 'Error',
            message: 'Failed to delete script',
            type: 'error'
          });
        }
      }
    });
  };

  // Add handleLogoClick function
  const handleLogoClick = () => {
    // Reset current project and script
    setCurrentProject(null);
    setCurrentScript(null);
    setShowLogs(false);
    // Close any open modals
    setIsNewProjectModalOpen(false);
    setIsApiKeyModalOpen(false);
    setIsScriptSettingsOpen(false);
  };

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      
      const dx = e.clientX - lastX.current;
      const newWidth = sidebarWidth + dx;
      
      // Constrain width between 200px and 600px
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
        lastX.current = e.clientX;
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarWidth]);

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    lastX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleUrlPathSave = (newPath: string) => {
    if (!selectedScript || !currentProject) return;
    
    // Update the script in the current project
    const updatedScripts = currentProject.scripts.map(script => 
      script.id === selectedScript.id 
        ? { ...script, urlPath: newPath }
        : script
    );
    
    // Update current project
    const updatedProject = { ...currentProject, scripts: updatedScripts };
    
    // Update projects list
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === currentProject.id ? updatedProject : project
      )
    );
    
    // Update current project and script
    setCurrentProject(updatedProject);
    if (currentScript?.id === selectedScript.id) {
      setCurrentScript({ ...currentScript, urlPath: newPath });
    }
    
    // Update selected script
    setSelectedScript(null);
    setIsUrlConfigOpen(false);
    
    // Show success message
    showAlert({
      title: 'Success',
      message: 'URL path updated successfully',
      type: 'success'
    });
  };

  const handleTestScript = (script: Script) => {
    setScriptToTest(script);
    setIsTestDialogOpen(true);
  };

  // Function to add a script change to history
  const addScriptChange = (change: Omit<ScriptChange, 'id' | 'timestamp'>) => {
    const newChange: ScriptChange = {
      ...change,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setScriptHistory(prev => [newChange, ...prev]);
  };

  // Helper function to generate a simple diff
  const generateDiff = (oldContent: string, newContent: string) => {
    if (oldContent === newContent) return '';
    
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    let diff = '';
    
    // Simple line-by-line comparison
    const maxLines = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (oldLines[i]) {
          diff += `-${oldLines[i]}\n`;
        }
        if (newLines[i]) {
          diff += `+${newLines[i]}\n`;
        }
      }
    }
    
    return diff;
  };

  // Add handleLoadScripts function
  const handleLoadScripts = async (files: File[]) => {
    if (!currentProject) return;

    const newScripts: Script[] = [];
    const defaultConfig = {
      memoryLimit: 128,
      timeout: 30000
    };

    for (const file of files) {
      try {
        const content = await file.text();
        const newScript: Script = {
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          content,
          config: defaultConfig,
          urlPath: `/projects/${currentProject.id}/scripts/${file.name}`
        };
        newScripts.push(newScript);

        // Record script creation in history
        addScriptChange({
          projectId: currentProject.id,
          projectName: currentProject.name,
          scriptName: file.name,
          changeType: 'create',
          description: 'Script loaded from file',
          author: currentUser?.name || 'Unknown User'
        });
      } catch (error) {
        console.error(`Error loading script ${file.name}:`, error);
        showAlert({
          title: 'Error',
          message: `Failed to load script ${file.name}`,
          type: 'error'
        });
      }
    }

    if (newScripts.length > 0) {
      const updatedProject = {
        ...currentProject,
        scripts: [...currentProject.scripts, ...newScripts]
      };

      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === currentProject.id ? updatedProject : p
        )
      );
      setCurrentProject(updatedProject);
      setCurrentScript(newScripts[0]);

      showAlert({
        title: 'Success',
        message: `Loaded ${newScripts.length} script${newScripts.length > 1 ? 's' : ''} successfully`,
        type: 'success'
      });
    }
  };

  // Add handleRenameScript function
  const handleRenameScript = (newName: string) => {
    if (!currentProject || !scriptToRename) return;

    // Create new script object with new name
    const renamedScript: Script = {
      ...scriptToRename,
      id: `${scriptToRename.id.split('-')[0]}-${newName}`,
      name: newName,
      urlPath: scriptToRename.urlPath.replace(scriptToRename.name, newName)
    };

    // Update project scripts
    const updatedScripts = currentProject.scripts.map(script =>
      script.id === scriptToRename.id ? renamedScript : script
    );

    // Update current project
    const updatedProject = {
      ...currentProject,
      scripts: updatedScripts
    };

    // Update projects list
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === currentProject.id ? updatedProject : project
      )
    );

    // Update current project and script references
    setCurrentProject(updatedProject);
    if (currentScript?.id === scriptToRename.id) {
      setCurrentScript(renamedScript);
    }

    // Record rename in history
    addScriptChange({
      projectId: currentProject.id,
      projectName: currentProject.name,
      scriptName: scriptToRename.name,
      changeType: 'rename',
      description: `Renamed from ${scriptToRename.name} to ${newName}`,
      author: currentUser?.name || 'Unknown User'
    });

    // Clear rename state
    setScriptToRename(null);

    // Show success message
    showAlert({
      title: 'Success',
      message: `Script renamed to ${newName}`,
      type: 'success'
    });
  };

  const handleUpdateProfile = (name: string, email: string) => {
    setCurrentUser(prev => prev ? { ...prev, name, email } : null);
    showAlert({
      title: 'Success',
      message: 'Profile updated successfully',
      type: 'success'
    });
  };

  // Add new function for project deletion
  const handleDeleteProject = async (projectId: string) => {
    // Show confirmation dialog
    showAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      type: 'warning',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await projectsApi.delete(parseInt(projectId));
          setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
          
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
            setCurrentScript(null);
          }

          showAlert({
            title: 'Success',
            message: 'Project deleted successfully',
            type: 'success'
          });
        } catch (error) {
          console.error('Failed to delete project:', error);
          let errorMessage = 'Failed to delete project';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          showAlert({
            title: 'Error',
            message: errorMessage,
            type: 'error'
          });
        }
      }
    });
  };

  const handleDragStart = (script: Script, e: React.DragEvent<HTMLDivElement>) => {
    setDraggedScript(script);
    // Set the drag image to be the same element
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    // Remove the clone after drag starts
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only allow horizontal movement
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetScript: Script) => {
    if (!draggedScript || !currentProject) return;

    const scripts = [...currentProject.scripts];
    const draggedIndex = scripts.findIndex(s => s.id === draggedScript.id);
    const targetIndex = scripts.findIndex(s => s.id === targetScript.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    scripts.splice(draggedIndex, 1);
    scripts.splice(targetIndex, 0, draggedScript);

    const updatedProject = {
      ...currentProject,
      scripts
    };

    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === currentProject.id ? updatedProject : p
      )
    );
    setCurrentProject(updatedProject);
    setDraggedScript(null);
  };

  const handleCreateScript = async (name: string) => {
    if (!currentProject) return;
    
    try {
      const path = `/projects/${currentProject.id}/scripts/${name}`;
      const response = await scriptsApi.create(
        parseInt(currentProject.id),
        path,
        '-- Your Lua script here\nprint("Hello, LuaScript Hub!")'
      );

      const newScript = {
        id: response.data.id.toString(),
        name,
        content: response.data.source_code,
        config: {
          memoryLimit: 128,
          timeout: 30000
        },
        urlPath: response.data.path
      };

      const updatedProject = {
        ...currentProject,
        scripts: [...currentProject.scripts, newScript]
      };

      setCurrentProject(updatedProject);
      setCurrentScript(newScript);

      showAlert({
        title: 'Success',
        message: `Script ${name} created successfully!`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to create script:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to create script',
        type: 'error'
      });
    }
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+S (or Cmd+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser's save dialog
        if (currentScript && currentProject) {
          handleSaveScript();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScript, currentProject]); // Dependencies for the effect

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header with gradient and shadow */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            className="flex items-center space-x-3 group focus:outline-none"
          >
            <div className="bg-white/20 p-2 rounded-lg transform transition-all duration-200 group-hover:scale-110 group-hover:bg-white/30">
              <i className="fas fa-code text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight transition-colors duration-200 group-hover:text-primary-50 font-display">
              MIET Lambda Hub
            </h1>
          </motion.button>
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDocumentation(!showDocumentation)}
              className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <i className={`fas fa-${showDocumentation ? 'home' : 'book'}`}></i>
              <span>{showDocumentation ? 'Home' : 'Documentation'}</span>
            </motion.button>
            {currentUser && (
              <>
                <button
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-key"></i>
                  <span>API Key</span>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-3 focus:outline-none">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-semibold text-lg transform transition-transform group-hover:scale-105">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <i className="fas fa-chevron-down text-white text-xs opacity-70 group-hover:opacity-100 transition-opacity"></i>
                  </button>
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl py-2 scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-body"
                      onClick={() => setShowProfile(true)}
                    >
                      Profile
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-body"
                      onClick={() => setShowSettings(true)}
                    >
                      Settings
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-dark-700 my-2"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-warning-600 dark:text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-900/30 transition-colors">Sign Out</button>
                  </div>
                </div>
              </>
            )}
            {!currentUser && (
              <div className="ml-8">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm bg-white hover:bg-opacity-90 text-primary-600 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showDocumentation ? (
            <motion.div
              key="documentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 w-full"
            >
              <Documentation />
            </motion.div>
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1"
            >
              {/* Sidebar */}
              <div 
                ref={sidebarRef}
                style={{ width: sidebarWidth }}
                className="relative hidden md:block bg-gradient-to-b from-gray-800 to-gray-900 dark:from-dark-800 dark:to-dark-900 text-white"
              >
                <div className="h-full overflow-y-auto">
                  <div className="p-6">
                    <motion.button
                      onClick={() => setIsNewProjectModalOpen(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors duration-200 mb-6 flex items-center justify-center space-x-2 relative group overflow-hidden"
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 2 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut"
                        }}
                      />
                      <motion.div className="relative flex items-center justify-center space-x-2">
                        <motion.i 
                          className="fas fa-plus"
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: 180 }}
                          transition={{ duration: 0.3 }}
                        />
                        <span>New Project</span>
                      </motion.div>
                    </motion.button>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-2">My Projects</h3>
                    <div className="space-y-2">
                      {projects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => openProject(project)}
                          className={`group cursor-pointer py-3 px-4 rounded-xl transition-all duration-200 ${
                            currentProject?.id === project.id 
                              ? 'bg-blue-600 shadow-lg' 
                              : 'hover:bg-white hover:bg-opacity-10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-grow">
                              <i className="fas fa-project-diagram opacity-70"></i>
                              <span className="truncate font-medium">{project.name}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                                currentProject?.id === project.id
                                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                              }`}
                              title="Delete Project"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-400 mt-1 truncate pl-7">{project.description}</p>
                          )}
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div className="text-gray-500 italic py-3 px-4">No projects yet</div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Resize Handle */}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 hover:bg-opacity-50 transition-colors"
                  onMouseDown={startResize}
                />
              </div>

              {/* Mobile Sidebar Toggle with animation */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl z-40 transform hover:scale-110 transition-all duration-200"
              >
                <i className="fas fa-bars"></i>
              </button>

              {/* Project Content Area */}
              <motion.div 
                className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentProject && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-gray-50 to-white dark:from-dark-900 dark:to-dark-800 border-b dark:border-dark-700 flex-shrink-0"
                  >
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{currentProject.name}</h2>
                        <p className="text-sm text-gray-600 mt-1">{currentProject.description || 'No description'}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setIsLoadScriptModalOpen(true)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                        >
                          <i className="fas fa-file-upload"></i>
                          <span>Load Scripts</span>
                        </button>
                        <button
                          onClick={() => setShowLogs(!showLogs)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                        >
                          <i className={`fas fa-${showLogs ? 'code' : 'history'}`}></i>
                          <span>{showLogs ? 'Editor' : 'Logs'}</span>
                        </button>
                        <button
                          onClick={() => setIsScriptSettingsOpen(true)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
                          disabled={!currentScript}
                        >
                          <i className="fas fa-cog"></i>
                          <span>Settings</span>
                        </button>
                        <button
                          onClick={handleSaveScript}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                        >
                          <i className="fas fa-save"></i>
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Script Tabs with animations */}
                {currentProject && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-50 dark:bg-dark-900 border-b dark:border-dark-700 flex-shrink-0 h-14"
                  >
                    <div className="container mx-auto h-full px-6">
                      <div className="flex items-center h-full">
                        <div className="flex items-center space-x-1 overflow-x-auto py-2 flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                          <AnimatePresence mode="popLayout">
                            {currentProject.scripts.map(script => (
                              <motion.div
                                key={script.name}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 flex-shrink-0 ${
                                  currentScript?.name === script.name
                                    ? 'bg-white shadow-md text-blue-600'
                                    : 'hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => setCurrentScript(script)}
                              >
                                <div
                                  draggable
                                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(script, e)}
                                  onDragOver={handleDragOver}
                                  onDrop={() => handleDrop(script)}
                                  className="flex items-center space-x-2"
                                >
                                  <i 
                                    className="fas fa-grip-vertical text-sm opacity-70 mr-2 cursor-move hover:text-blue-600 transition-colors"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.parentElement?.style.setProperty('cursor', 'move');
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.parentElement?.style.setProperty('cursor', 'pointer');
                                    }}
                                  ></i>
                                  <i className="fas fa-file-code text-sm opacity-70"></i>
                                  <span className="whitespace-nowrap">{script.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 ml-2">
                                  <button
                                    className="text-gray-400 hover:text-purple-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTestScript(script);
                                    }}
                                    title="Test Script"
                                  >
                                    <i className="fas fa-flask text-sm"></i>
                                  </button>
                                  <button
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedScript(script);
                                      setIsUrlConfigOpen(true);
                                    }}
                                    title="Configure URL Path"
                                  >
                                    <i className="fas fa-link text-sm"></i>
                                  </button>
                                  <button
                                    className="text-gray-400 hover:text-yellow-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScriptToRename(script);
                                    }}
                                    title="Rename Script"
                                  >
                                    <i className="fas fa-pencil-alt text-sm"></i>
                                  </button>
                                  <button
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteScript(script.name);
                                    }}
                                    title="Delete Script"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsNewScriptModalOpen(true)}
                          className="ml-4 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2 flex-shrink-0"
                        >
                          <i className="fas fa-plus"></i>
                          <span className="text-sm whitespace-nowrap">New Script</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Main Content Area with animations */}
                <AnimatePresence mode="wait">
                  {currentProject && currentScript ? (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 min-h-0 relative dark:bg-dark-900"
                    >
                      {showLogs ? (
                        <ExecutionLogs
                          logs={executionLogs}
                          scriptHistory={scriptHistory}
                          onClearLogs={handleClearLogs}
                          currentProjectId={currentProject.id}
                        />
                      ) : (
                        <div className="absolute inset-0">
                          <CodeEditor
                            value={currentScript.content}
                            onChange={(value) => {
                              setCurrentScript({
                                ...currentScript,
                                content: value
                              });
                            }}
                          />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.8 }}
                        className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8"
                      >
                        <i className="fas fa-code text-blue-600 text-3xl"></i>
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-gray-800 mb-4 font-display"
                      >
                        Welcome to MIET Lambda Hub
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 max-w-lg mb-8 leading-relaxed font-body"
                      >
                        Create a new project to start writing and executing Lua scripts in the cloud. 
                        Your scripts can be executed via our HTTP API from anywhere.
                      </motion.p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsNewProjectModalOpen(true)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <i className="fas fa-plus"></i>
                        <span>Create Project</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
      />
      {currentScript && (
        <ScriptSettings
          isOpen={isScriptSettingsOpen}
          onClose={() => setIsScriptSettingsOpen(false)}
          settings={currentScript.config}
          onSave={handleScriptSettingsSave}
        />
      )}
      {currentProject && (
        <NewScriptModal
          isOpen={isNewScriptModalOpen}
          onClose={() => setIsNewScriptModalOpen(false)}
          onCreate={handleCreateScript}
          existingScriptNames={currentProject.scripts.map(s => s.name)}
        />
      )}
      <Alert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmLabel={alert.confirmLabel}
        cancelLabel={alert.cancelLabel}
        onConfirm={alert.onConfirm}
      />
      {selectedScript && (
        <ScriptUrlConfig
          isOpen={isUrlConfigOpen}
          onClose={() => setIsUrlConfigOpen(false)}
          urlPath={selectedScript.urlPath}
          onSave={handleUrlPathSave}
          projectId={selectedScript.id.split('-')[0]}
          scriptName={selectedScript.name}
        />
      )}
      {scriptToTest && (
        <ScriptTestDialog
          isOpen={isTestDialogOpen}
          onClose={() => {
            setIsTestDialogOpen(false);
            setScriptToTest(null);
          }}
          scriptName={scriptToTest.name}
          urlPath={scriptToTest.urlPath || ''}
          projectName={currentProject?.name}
        />
      )}
      {/* Load Script Modal */}
      {currentProject && (
        <LoadScriptModal
          isOpen={isLoadScriptModalOpen}
          onClose={() => setIsLoadScriptModalOpen(false)}
          onLoad={handleLoadScripts}
          existingScriptNames={currentProject.scripts.map(s => s.name)}
        />
      )}
      {/* Rename Script Modal */}
      {scriptToRename && currentProject && (
        <RenameScriptModal
          isOpen={!!scriptToRename}
          onClose={() => setScriptToRename(null)}
          onRename={handleRenameScript}
          currentName={scriptToRename.name}
          existingNames={currentProject.scripts.map(s => s.name)}
        />
      )}
      {/* Profile Page */}
      <AnimatePresence>
        {showProfile && currentUser && (
          <div className="fixed inset-0 bg-white z-50">
            <ProfilePage
              user={currentUser}
              onClose={() => setShowProfile(false)}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}
      </AnimatePresence>
      {/* Settings Page */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-white z-50">
            <SettingsPage
              onClose={() => setShowSettings(false)}
              editorFontSize={editorFontSize}
              onEditorFontSizeChange={setEditorFontSize}
              autoSave={autoSave}
              onAutoSaveChange={setAutoSave}
              notifications={notifications}
              onNotificationsChange={setNotifications}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <AppContent />
        {/* Copyright Footer */}
      </div>
    </ThemeProvider>
  );
};

export default App;

<footer className="mt-auto relative">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-50/30 to-accent-100/40 dark:from-transparent dark:via-dark-800/50 dark:to-dark-900/60 pointer-events-none" />
  
  {/* Main footer content */}
  <div className="relative px-6 py-3 bg-gradient-to-r from-white/90 to-accent-50/90 dark:from-dark-900/90 dark:to-dark-800/90 backdrop-blur-sm border-t border-accent-200/20 dark:border-dark-700/30">
    <div className="container mx-auto">
      {/* Top section with links */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center space-x-6">
          <motion.a 
            href="#"
            className="text-sm text-dark-600 dark:text-dark-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors flex items-center space-x-1 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-shield-alt text-accent-600/70 group-hover:text-accent-600 dark:text-accent-400/70 dark:group-hover:text-accent-400 transition-colors" />
            <span>Terms of Service</span>
          </motion.a>
          <motion.a 
            href="#"
            className="text-sm text-dark-600 dark:text-dark-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors flex items-center space-x-1 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-user-shield text-accent-600/70 group-hover:text-accent-600 dark:text-accent-400/70 dark:group-hover:text-accent-400 transition-colors" />
            <span>Privacy Policy</span>
          </motion.a>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.a 
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-600 dark:text-dark-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fab fa-github text-xl" />
          </motion.a>
          <motion.a 
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-600 dark:text-dark-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fab fa-twitter text-xl" />
          </motion.a>
          <motion.a 
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-600 dark:text-dark-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fab fa-discord text-xl" />
          </motion.a>
        </div>
      </div>

      {/* Bottom section with copyright */}
      <div className="flex justify-center pt-4 border-t border-accent-200/20 dark:border-dark-700/30">
        <div className="flex items-center">
          <motion.div 
            className="bg-gradient-to-br from-accent-500 to-accent-600 p-1.5 rounded-lg shadow-sm mr-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-code text-white text-sm"></i>
          </motion.div>
          <div className="text-sm font-body">
            <span className="text-dark-600 dark:text-dark-400">© 2025 </span>
            <span className="font-semibold text-accent-700 dark:text-accent-400 font-display">
              MIET Lambda Hub
            </span>
            <span className="text-dark-600 dark:text-dark-400"> • All rights reserved</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

