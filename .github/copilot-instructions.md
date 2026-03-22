- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	Skip if already provided.

- [x] Scaffold the Project
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.

- [x] Customize the Project
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.

- [x] Install Required Extensions
	ONLY install extensions provided mentioned in the get_project_setup_info. Skip this step otherwise and mark as completed.

- [x] Compile the Project
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.

- [x] Create and Run Task
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.

- [x] Launch the Project
	Prompt user for debug mode, launch only if confirmed.

- [x] Ensure Documentation is Complete
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.