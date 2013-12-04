automating-ip-lookup-for-servers

In the last few write-ups I've done lately, I've been consistently passing in the IP or the host. That works and all, but I usually have to go look up that ip using the good ol 'ifconfig' command.

## You should be asking.. automate the IP?

About 7/10 times I really just want to boot the servers up to my current IP and have the mobile app point at that IP.

Have you guessed it yet? I want to automatically set that hostname based on a flag passed in.

I found this post on [stackoverflow](http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js) that pointed me at this [Node.js documentation](http://nodejs.org/api/os.html#os_os_networkinterfaces).

### 