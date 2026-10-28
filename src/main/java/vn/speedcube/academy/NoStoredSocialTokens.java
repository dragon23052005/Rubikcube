package vn.speedcube.academy;
import org.springframework.security.oauth2.client.*;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.*;
/** Only identity login is needed; discard provider access/refresh tokens after user-info retrieval. */
public class NoStoredSocialTokens implements OAuth2AuthorizedClientRepository {
 public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(String id,Authentication principal,HttpServletRequest request){return null;}
 public void saveAuthorizedClient(OAuth2AuthorizedClient client,Authentication principal,HttpServletRequest request,HttpServletResponse response){}
 public void removeAuthorizedClient(String id,Authentication principal,HttpServletRequest request,HttpServletResponse response){}
}
