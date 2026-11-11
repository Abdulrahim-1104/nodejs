# What is Child Process

- child process is a process that is created by another process
- simply since node js is a single threaded language, if we need an heavy work task we can create a child process. The child process is not a seperate thread. it creates a new process as child process and the nodejs as the parent process and that child process have the seperate PID(process id), Memory space etc.. and it can communicate with the parent process using the IPC (Inter-Process Communication) can stream the data.
