package com.aragon.launcher.ui;

import com.aragon.launcher.model.Manifest;
import com.aragon.launcher.service.ClientLauncher;
import com.aragon.launcher.service.UpdateService;
import com.aragon.launcher.util.Config;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.Optional;

public class LauncherController {
    private static final Logger logger = LoggerFactory.getLogger(LauncherController.class);
    
    private final BorderPane root;
    private final Label statusLabel;
    private final ProgressBar progressBar;
    private final Label progressLabel;
    private final Button playButton;
    private final Button settingsButton;
    private final Button closeButton;
    private final Button minimizeButton;
    
    private final UpdateService updateService;
    private final ClientLauncher clientLauncher;
    private final Config config;
    
    private Stage stage;
    private double xOffset = 0;
    private double yOffset = 0;
    
    public LauncherController() {
        this.updateService = new UpdateService();
        this.clientLauncher = new ClientLauncher();
        this.config = Config.load();
        
        root = new BorderPane();
        root.setPrefSize(800, 500);
        root.getStyleClass().add("launcher-root");
        
        VBox topBar = createTopBar();
        VBox centerContent = createCenterContent();
        HBox bottomBar = createBottomBar();
        
        statusLabel = new Label("Initializing...");
        statusLabel.getStyleClass().add("status-label");
        
        progressBar = new ProgressBar(0);
        progressBar.setPrefWidth(400);
        progressBar.getStyleClass().add("download-progress");
        
        progressLabel = new Label("");
        progressLabel.getStyleClass().add("progress-label");
        
        playButton = new Button("PLAY");
        playButton.getStyleClass().add("play-button");
        playButton.setPrefWidth(200);
        playButton.setPrefHeight(50);
        playButton.setDisable(true);
        playButton.setOnAction(e -> onPlayClicked());
        
        settingsButton = new Button("⚙");
        settingsButton.getStyleClass().add("icon-button");
        settingsButton.setOnAction(e -> showSettingsDialog());
        
        closeButton = new Button("✕");
        closeButton.getStyleClass().add("close-button");
        closeButton.setOnAction(e -> {
            if (stage != null) {
                stage.close();
            }
        });
        
        minimizeButton = new Button("−");
        minimizeButton.getStyleClass().add("minimize-button");
        minimizeButton.setOnAction(e -> {
            if (stage != null) {
                stage.setIconified(true);
            }
        });
        
        VBox contentBox = new VBox(20);
        contentBox.setAlignment(Pos.CENTER);
        contentBox.setPadding(new Insets(40));
        contentBox.getChildren().addAll(
            centerContent,
            statusLabel,
            progressBar,
            progressLabel,
            playButton
        );
        
        root.setTop(topBar);
        root.setCenter(contentBox);
        root.setBottom(bottomBar);
    }
    
    private VBox createTopBar() {
        HBox topControls = new HBox(5);
        topControls.setAlignment(Pos.CENTER_RIGHT);
        topControls.setPadding(new Insets(5));
        topControls.getChildren().addAll(minimizeButton, closeButton);
        
        VBox topBar = new VBox();
        topBar.getStyleClass().add("top-bar");
        topBar.getChildren().add(topControls);
        
        topBar.setOnMousePressed(event -> {
            xOffset = event.getSceneX();
            yOffset = event.getSceneY();
        });
        
        topBar.setOnMouseDragged(event -> {
            if (stage != null) {
                stage.setX(event.getScreenX() - xOffset);
                stage.setY(event.getScreenY() - yOffset);
            }
        });
        
        topBar.setCursor(Cursor.HAND);
        
        return topBar;
    }
    
    private VBox createCenterContent() {
        VBox content = new VBox(20);
        content.setAlignment(Pos.CENTER);
        
        try (InputStream logoStream = getClass().getResourceAsStream("/images/logo.png")) {
            if (logoStream != null) {
                Image logo = new Image(logoStream);
                ImageView logoView = new ImageView(logo);
                logoView.setFitWidth(400);
                logoView.setPreserveRatio(true);
                content.getChildren().add(logoView);
            }
        } catch (Exception e) {
            logger.warn("Failed to load logo", e);
            Label titleLabel = new Label("ARAGON");
            titleLabel.getStyleClass().add("title-label");
            content.getChildren().add(titleLabel);
        }
        
        return content;
    }
    
    private HBox createBottomBar() {
        HBox bottomBar = new HBox(10);
        bottomBar.setAlignment(Pos.CENTER_RIGHT);
        bottomBar.setPadding(new Insets(10));
        bottomBar.getStyleClass().add("bottom-bar");
        
        Label versionLabel = new Label("Launcher v" + Config.LAUNCHER_VERSION);
        versionLabel.getStyleClass().add("version-label");
        
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        
        bottomBar.getChildren().addAll(versionLabel, spacer, settingsButton);
        
        return bottomBar;
    }
    
    public void initialize(Stage stage) {
        this.stage = stage;
        checkForUpdates();
    }
    
    private void checkForUpdates() {
        Thread updateThread = new Thread(() -> {
            try {
                updateStatus("Checking for updates...");
                
                Manifest remote = updateService.fetchRemoteManifest();
                Manifest local = updateService.loadLocalManifest();
                
                if (updateService.checkForUpdates(remote, local)) {
                    updateStatus("Update available, downloading...");
                    
                    String os = UpdateService.getOSIdentifier();
                    Manifest.FileEntry fileToDownload = remote.getFileForOS(os);
                    
                    if (fileToDownload == null) {
                        fileToDownload = remote.getFileForOS("standalone");
                    }
                    
                    if (fileToDownload != null) {
                        updateService.downloadFile(fileToDownload, progress -> {
                            Platform.runLater(() -> {
                                progressBar.setProgress(progress.getPercentage() / 100.0);
                                progressLabel.setText(String.format("%s - %s - ETA: %s",
                                    progress.getFormattedSize(),
                                    progress.getFormattedSpeed(),
                                    progress.getFormattedETA()));
                            });
                        });
                        
                        updateService.saveLocalManifest(remote);
                        String version = remote.getLatest().getVersionForOS(os);
                        config.setLastVersion(version);
                        config.save();
                    }
                }
                
                Platform.runLater(() -> {
                    updateStatus("Ready to play!");
                    progressBar.setProgress(1.0);
                    progressLabel.setText("");
                    playButton.setDisable(false);
                });
                
            } catch (Exception e) {
                logger.error("Update check failed", e);
                Platform.runLater(() -> {
                    updateStatus("Error: " + e.getMessage());
                    showErrorDialog("Update Failed", "Failed to check for updates: " + e.getMessage());
                });
            }
        });
        
        updateThread.setDaemon(true);
        updateThread.start();
    }
    
    private void onPlayClicked() {
        if (clientLauncher.isClientRunning()) {
            showInfoDialog("Client Running", "The game client is already running!");
            return;
        }
        
        playButton.setDisable(true);
        updateStatus("Launching client...");
        
        Thread launchThread = new Thread(() -> {
            try {
                clientLauncher.launchClient(config.getJvmArgs());
                
                Platform.runLater(() -> {
                    updateStatus("Client is running");
                    playButton.setText("RUNNING");
                    
                    if (config.isMinimizeToTray() && stage != null) {
                        stage.setIconified(true);
                    }
                });
                
            } catch (Exception e) {
                logger.error("Failed to launch client", e);
                Platform.runLater(() -> {
                    updateStatus("Launch failed");
                    playButton.setDisable(false);
                    playButton.setText("PLAY");
                    showErrorDialog("Launch Failed", "Failed to launch client: " + e.getMessage());
                });
            }
        });
        
        launchThread.setDaemon(true);
        launchThread.start();
    }
    
    private void showSettingsDialog() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Settings");
        dialog.setHeaderText("Launcher Settings");
        
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20));
        
        Label jvmLabel = new Label("JVM Arguments:");
        TextField jvmField = new TextField(config.getJvmArgs());
        jvmField.setPrefWidth(300);
        
        CheckBox minimizeCheckbox = new CheckBox("Minimize to tray on game launch");
        minimizeCheckbox.setSelected(config.isMinimizeToTray());
        
        CheckBox autoUpdateCheckbox = new CheckBox("Automatically check for updates");
        autoUpdateCheckbox.setSelected(config.isAutoUpdate());
        
        grid.add(jvmLabel, 0, 0);
        grid.add(jvmField, 1, 0);
        grid.add(minimizeCheckbox, 0, 1, 2, 1);
        grid.add(autoUpdateCheckbox, 0, 2, 2, 1);
        
        dialog.getDialogPane().setContent(grid);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);
        
        Optional<ButtonType> result = dialog.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            config.setJvmArgs(jvmField.getText());
            config.setMinimizeToTray(minimizeCheckbox.isSelected());
            config.setAutoUpdate(autoUpdateCheckbox.isSelected());
            config.save();
            
            logger.info("Settings saved");
        }
    }
    
    private void updateStatus(String status) {
        statusLabel.setText(status);
        logger.info(status);
    }
    
    private void showErrorDialog(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
    
    private void showInfoDialog(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
    
    public void shutdown() {
        if (clientLauncher.isClientRunning()) {
            clientLauncher.stopClient();
        }
    }
    
    public BorderPane getRoot() {
        return root;
    }
}
