package test.java.fr.ubo.djf.User;

import main.java.fr.ubo.djf.User.User;
import main.java.fr.ubo.djf.User.UserController;
import main.java.fr.ubo.djf.User.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // Active Mockito pour ce test
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @Test
    void getAllUsers_ShouldReturnList() {
        User user1 = new User(1L, "Alice", "alice@test.com");
        User user2 = new User(2L, "Bob", "bob@test.com");
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        ResponseEntity<?> response = userController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<User> body = (List<User>) response.getBody();
        assertEquals(2, body.size());
    }

    @Test
    void createUser_ShouldReturnSavedUser() {
        User userToSend = new User(null, "Charlie", "charlie@test.com");
        User userSaved = new User(3L, "Charlie", "charlie@test.com");

        when(userRepository.save(any(User.class))).thenReturn(userSaved);

        ResponseEntity<?> response = userController.createUser(userToSend);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        User result = (User) response.getBody();
        assertEquals(3L, result.getId());
    }

    @Test
    void updateUser_ShouldReturnUpdatedUser() {
        Long userId = 1L;
        User existingUser = new User(userId, "OldName", "old@test.com");
        User updateInfo = new User(null, "NewName", "new@test.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = userController.updateUser(userId, updateInfo);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        User result = (User) response.getBody();
        assertEquals("NewName", result.getUsername());
    }

    @Test
    void updateUser_WhenNotFound_ShouldReturn404() {
        Long userId = 99L;
        User updateInfo = new User(null, "Ghost", "ghost@test.com");

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.updateUser(userId, updateInfo);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getAllUsers_WhenDbCrash_ShouldReturn500() {
        when(userRepository.findAll()).thenThrow(new RuntimeException("Database connection failed"));

        ResponseEntity<?> response = userController.getAllUsers();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Erreur serveur", response.getBody());
    }
}