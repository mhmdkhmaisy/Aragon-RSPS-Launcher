package com.aragon.launcher;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import com.aragon.launcher.ui.LauncherController;
import com.aragon.launcher.util.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;

public class Main extends Application {
    private static final Logger logger = LoggerFactory.getLogger(Main.class);
    private static final String APP_TITLE = "Aragon Launcher";
    
    @Override
    public void start(Stage primaryStage) {
        try {
            logger.info("Starting Aragon Launcher v{}", Config.LAUNCHER_VERSION);
            
            LauncherController controller = new LauncherController();
            Scene scene = new Scene(controller.getRoot(), 800, 500);
            
            scene.getStylesheets().add(getClass().getResource("/css/launcher.css").toExternalForm());
            
            primaryStage.setTitle(APP_TITLE);
            primaryStage.setScene(scene);
            primaryStage.setResizable(false);
            primaryStage.initStyle(StageStyle.UNDECORATED);
            
            try (InputStream iconStream = getClass().getResourceAsStream("/images/icon.png")) {
                if (iconStream != null) {
                    primaryStage.getIcons().add(new Image(iconStream));
                }
            }
            
            primaryStage.setOnCloseRequest(event -> {
                controller.shutdown();
                Platform.exit();
                System.exit(0);
            });
            
            primaryStage.show();
            
            controller.initialize(primaryStage);
            
        } catch (Exception e) {
            logger.error("Failed to start launcher", e);
            Platform.exit();
            System.exit(1);
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
