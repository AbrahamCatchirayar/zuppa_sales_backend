module.exports = {
  apps: [
    {
      name: "rubicr-backend", // Name of your app
      script: "npm", // Command to run
      args: "run start:prod", // Arguments for the command
      cwd: "/home/ubuntu/rubicr/rubicr_v2_backendservice", // Path to your app
      env: {
	//NODE_ENV: "production", // Set environment variable
        PORT: 5000, // Change the port if needed
      },
      watch: false, // Disable file watching in production
      autorestart: true, // Restart app on crashes
      // Memory management settings
      node_args: [
        "--max-old-space-size=4096", // Increase heap size to 4GB
        "--expose-gc", // Enable manual garbage collection
        "--optimize-for-size", // Optimize for memory usage
        "--gc-interval=100", // More frequent garbage collection
      ],
      // Memory limits
      max_memory_restart: "3G", // Restart if memory exceeds 3GB
      // Error handling
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true, // Add timestamps to logs
    },
  ],
};

