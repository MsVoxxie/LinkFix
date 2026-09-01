module.exports = {
	apps: [
		{
			name: 'noNameLinks',
			script: './noNameLinks.js',
			cwd: __dirname,
			instances: 1,
			exec_mode: 'fork',
			node_args: '--no-deprecation',
			autorestart: true,
			watch: false,
			max_memory_restart: '300M',
			merge_logs: true,
			time: true,
			env: {
				NODE_ENV: 'production',
			},
		},
	],
};
