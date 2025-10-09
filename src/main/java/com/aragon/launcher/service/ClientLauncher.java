package com.aragon.launcher.service;

import com.aragon.launcher.util.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class ClientLauncher {
    private static final Logger logger = LoggerFactory.getLogger(ClientLauncher.class);
    private Process clientProcess;
    
    public void launchClient(String jvmArgs) throws IOException {
        Path clientJar = Config.getClientJar();
        
        if (!Files.exists(clientJar)) {
            throw new IOException("Client JAR not found: " + clientJar);
        }
        
        String javaPath = getJavaExecutable();
        List<String> command = new ArrayList<>();
        command.add(javaPath);
        
        if (jvmArgs != null && !jvmArgs.trim().isEmpty()) {
            String[] args = jvmArgs.trim().split("\\s+");
            for (String arg : args) {
                if (!arg.isEmpty()) {
                    command.add(arg);
                }
            }
        }
        
        command.add("-jar");
        command.add(clientJar.toAbsolutePath().toString());
        
        logger.info("Launching client with command: {}", String.join(" ", command));
        
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(Config.getInstallDir().toFile());
        pb.redirectErrorStream(true);
        
        clientProcess = pb.start();
        
        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(clientProcess.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    logger.info("[CLIENT] {}", line);
                }
            } catch (IOException e) {
                logger.error("Error reading client output", e);
            }
        }).start();
        
        logger.info("Client launched successfully");
    }
    
    public boolean isClientRunning() {
        return clientProcess != null && clientProcess.isAlive();
    }
    
    public void stopClient() {
        if (clientProcess != null && clientProcess.isAlive()) {
            logger.info("Stopping client process");
            clientProcess.destroy();
            try {
                clientProcess.waitFor();
            } catch (InterruptedException e) {
                logger.warn("Interrupted while waiting for client to stop", e);
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private String getJavaExecutable() {
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome + File.separator + "bin" + File.separator + "java";
        
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            javaBin += ".exe";
        }
        
        File javaFile = new File(javaBin);
        if (javaFile.exists()) {
            return javaBin;
        }
        
        return "java";
    }
}
