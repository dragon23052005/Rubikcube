package vn.speedcube.academy.study;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CaseMemoryRepository extends JpaRepository<CaseMemory,String>{java.util.List<CaseMemory> findByUserId(String userId);}
