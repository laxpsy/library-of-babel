---
title: "Software Engineering Weekly | Nov 9: Amazon Firecracker"
description: SEW (Software Engineering Weekly) is a blog series dedicated to exploring and sharing insights from the world of software engineering. Each week, I take a deep dive into a specific article, blog post, or research paper, providing a comprehensive summary and analysis. This series aims to keep myself updated on the latest trends, best practices, and innovative ideas in the field of software engineering. By documenting what I learn, I aim to keep myself accountable in the long run.
pubDate: 09/11/2024
---
# Week-1: Amazon Firecracker: Lightweight Virtualization
## References 
- https://www.usenix.org/system/files/nsdi20-paper-agache.pdf | Research Paper
- https://github.com/firecracker-microvm/firecracker/tree/main | Firecracker Repo

## Keywords 
- **Serverless Functions**: deploy, do not worry about scaling. resources _warp_ around your usage. best for applications where the traffic is highly bursty in nature. you'll be charged based on the number of times your function runs. 
- **VMM** or **Hypervisor**:  responsible for management of VMs. two types - type-1 runs at the bare-metal level, not through an OS. type-2 runs directly on the OS, it interacts with the host-machine through the host-OS.
- **TCB**: trusted computing base. set of all hardware/firmware/software components critical to the system's security. any action jeopardizing the sanctity of the TCB might jeopardize the entire system.
- **Sticky-routing**: consistently routing requests for the same function (or group of functions) to a specific subset of workers in order to reduce overhead and improve performance.
- **QEMU**: FOSS processor emulator. used in conjunction with KVM (see below) to execute virtual machines at near-native speeds. supports x86, ARM, RISC-V, PowerPC and on and on.
- **KVM**: virtualization module for the Linux Kernel. dependent on user-space programs like _QEMU_ (see above) or _Firecracker_ (see below) for the actual emulation. provides a `/dev/kvm` abstraction to allow the userspace program to set up VMs.
- **Firecracker**: an open-source VMM built to handle the popular serverless offering _AWS Lambda_. why? traditional VMs? highly isolated, but too much overhead. containerization? weaker security, but minimal overhead. runs in conjunction with KVM. a very stripped down version of QEMU to only support the bare-minimum emulation needed for serverless workloads, written in Rust and from scratch. 

## Summary
Traditional containerization methods (that use the host Kernel for isolation) have a very large TCB, there is a constant security v/s functionality dilemma (because syscalls have to be restricted on a per-container level). On the other hand, traditional VMs have way too much overhead but amazing security benefits. Firecracker presents a solution by spinning up *MicroVMs* with minimal overhead and blazingly fast startup times for each instance. It was designed to handle serverless workloads (AWS Lambda) by removing unnecessary emulation layers/capabilities found in QEMU. Unlike QEMU, which supports a wide range of architectures, peripherals - Firecracker excludes most of them and only includes the bare-minimum emulation necessary for serverless operations. It provides a REST API interface for the host to configure the parameters for each MicroVM instance spun up, set limits and so on, has a [Jailer](https://www.youtube.com/watch?v=1F3hm6MfR1k) instance to handle security and set up the Firecracker process sandboxed (see highlights). 

![](https://github.com/firecracker-microvm/firecracker/raw/main/docs/images/firecracker_host_integration.png?raw=true)

The design philosophy reflected in the paper has been - *do not reinvent the wheel* until and unless there was a very compelling reason to do it, atleast. If there isn't a reason strong enough - use the features of the host OS. Result - `~3MB` overhead, `~100ms` startup times for each MicroVM instance. 

## Highlights
> Container implementors can choose to improve security by limiting syscalls, at the cost of breaking code which requires the restricted calls. This introduces difficult tradeoffs: implementors of serverless and container services can choose between hypervisor-based virtualization (and the potentially unacceptable overhead related to it), and Linux containers (and the related compatibility vs. security tradeoffs).

>Firecracker’s approach to these problems is to use KVM (for reasons we discuss in section 3), but replace the VMM with a minimal implementation written in a safe language. Minimizing the feature set of the VMM helps reduce surface area, and controls the size of the TCB. Firecracker contains approximately 50k lines of Rust code (96% fewer lines than QEMU), including multiple levels of automated tests, and auto-generated bindings. Intel Cloud Hypervisor [25] takes a similar approach, (and indeed shares much code with Fire- cracker), while NEMU [24] aims to address these problems by cutting down QEMU.

> We chose to support block devices for storage, rather than file-system passthrough as a security consideration. File-systems are large and complex code-bases, and providing only block IO to the guest protects a substantial part of the host kernel surface area.

> Firecracker users can interact with the API using an HTTP client in their language of choice, or from the command line using tools like curl. REST APIs exist for specifying the guest kernel and boot arguments, network configuration, block device configuration, guest machine configuration and cpuid, logging, metrics, rate limiters, and the metadata service. Common defaults are pro-vided for most configurations, so in the simplest use only the guest kernel and one (root) block device need to be configured before the VM is started. To shut down the MicroVM, it is sufficient to kill the Firecracker process.

> The jailer implements a wrapper around Firecracker which places it into a restrictive sandbox before it boots the guest, including running it in a `chroot`, isolating it in `pid` and network namespaces, dropping privileges, and setting a restrictive `seccomp-bpf` profile. The sandbox’s `chroot` contains only the Firecracker binary, `/dev/net/tun`, cgroups control files, and any resources the particular MicroVM needs access to (such as its storage image). The `seccomp-bpf` profile whitelists 24 syscalls, each with additional argument filtering, and 30 `ioctls` (of which 22 are required by KVM ioctl-based API).

> This is consistent with our philosophy. We implemented performance limits in Firecracker where there was a compelling reason: enforcing rate limits in device emulation allows us to strongly control the amount of VMM and host kernel CPU time that a guest can consume, and we do not trust the guest to implement its own limits. Where we did not have a compelling reason to add the functionality to Firecracker, we use the capabilities of the host OS.

> The MicroManager also keeps a small pool of pre-booted MicroVMs, ready to be used when Placement requests a new slot. While the 125ms boot times offered by Firecracker are fast, they are not fast enough for the scale-up path of Lambda, which is sometimes blocking user requests. Fast booting is a first-order design requirement for Firecracker, both because boot time is a proxy for resources consumed during boot, and because fast boots allow Lambda to keep these spare pools small.

> Once the Frontend has been allocated a slot by the WorkerManager, it calls the MicroManager with the details of the slot and request payload, which the MicroManager passes on to the Lambda shim running inside the MicroVM for that slot. On completion, the MicroManager receives the response payload (or error details in case of a failure), and passes these onto the Frontend for response to the customer.

> ~3MB overhead, ~100ms startup times.


